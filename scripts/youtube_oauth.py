"""One-off, loopback-only YouTube authorization; never log codes or tokens."""

import base64
import hashlib
import hmac
import os
import secrets
import time
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlsplit

import httpx
from dotenv import dotenv_values, set_key

ROOT = Path(__file__).resolve().parents[1]
REDIRECT = 'http://127.0.0.1:8766/oauth/callback'
SCOPES = (
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
)


def main():
    env = dotenv_values(ROOT / '.env')
    if not env.get('GOOGLE_CLIENT_ID') or not env.get('GOOGLE_CLIENT_SECRET'):
        raise SystemExit('Google client credentials are missing.')
    state = secrets.token_urlsafe(32)
    session = secrets.token_urlsafe(32)
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b'=')
    deadline = time.monotonic() + 1800
    completed = False
    started = False

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def reply(self, status, body='', **headers):
            self.send_response(status)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.send_header('Content-Security-Policy', "default-src 'none'")
            for key, value in headers.items():
                self.send_header(key.replace('_', '-'), value)
            self.end_headers()
            self.wfile.write(body.encode())

        def do_GET(self):
            nonlocal completed, started
            if self.headers.get('Host') != '127.0.0.1:8766':
                return self.reply(400, 'Invalid host.')
            if time.monotonic() > deadline or completed:
                return self.reply(410, 'Autorisierung beendet. Assistent neu starten.')
            url = urlsplit(self.path)
            if url.path == '/start':
                started = True
                location = 'https://accounts.google.com/o/oauth2/v2/auth?' + urlencode({
                    'client_id': env['GOOGLE_CLIENT_ID'], 'redirect_uri': REDIRECT,
                    'response_type': 'code', 'scope': ' '.join(SCOPES),
                    'access_type': 'offline', 'prompt': 'consent', 'state': state,
                    'code_challenge': challenge.decode(), 'code_challenge_method': 'S256',
                })
                return self.reply(302, Location=location,
                                  Set_Cookie=f'sonio_oauth={session}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800')
            if url.path != '/oauth/callback':
                return self.reply(404, 'Not found.')
            query = parse_qs(url.query)
            cookie = SimpleCookie()
            cookie.load(self.headers.get('Cookie', ''))
            value = cookie.get('sonio_oauth')
            if (not started or not value or not hmac.compare_digest(value.value, session)
                    or len(query.get('state', [])) != 1
                    or not hmac.compare_digest(query['state'][0], state)):
                return self.reply(400, 'Ungültige OAuth-Sitzung.')
            if 'error' in query or len(query.get('code', [])) != 1:
                return self.reply(400, 'Freigabe nicht erteilt. Keine Zugangsdaten gespeichert.')
            try:
                with httpx.Client(timeout=30) as client:
                    response = client.post('https://oauth2.googleapis.com/token', data={
                        'client_id': env['GOOGLE_CLIENT_ID'],
                        'client_secret': env['GOOGLE_CLIENT_SECRET'],
                        'code': query['code'][0], 'code_verifier': verifier,
                        'grant_type': 'authorization_code', 'redirect_uri': REDIRECT,
                    })
                    response.raise_for_status()
                    token = response.json()
                    if not set(SCOPES).issubset(set(token.get('scope', '').split())):
                        raise ValueError('Missing scopes')
                    if not token.get('refresh_token'):
                        raise ValueError('Missing refresh token')
                    headers = {'Authorization': 'Bearer ' + token['access_token']}
                    # Match the user's exact public handle to an authorized channel.
                    target = client.get('https://www.googleapis.com/youtube/v3/channels',
                                        headers=headers, params={'part': 'id',
                                        'forHandle': '@sonio-channel_2023'})
                    target.raise_for_status()
                    targets = target.json().get('items', [])
                    owned = client.get('https://www.googleapis.com/youtube/v3/channels',
                                       headers=headers, params={'part': 'id', 'mine': 'true',
                                       'maxResults': 50})
                    owned.raise_for_status()
                    if len(targets) != 1 or targets[0]['id'] not in {
                        item['id'] for item in owned.json().get('items', [])
                    }:
                        raise ValueError('Wrong channel')
                    channel_id = targets[0]['id']
                os.chmod(ROOT / '.env', 0o600)
                set_key(ROOT / '.env', 'GOOGLE_REFRESH_TOKEN', token['refresh_token'])
                set_key(ROOT / '.env', 'YOUTUBE_CHANNEL_ID', channel_id)
                os.chmod(ROOT / '.env', 0o600)
                completed = True
                print('Sonio-Kanal verifiziert. Refresh-Token lokal gespeichert.', flush=True)
                return self.reply(200, '<h1>Sonio YouTube verbunden</h1><p>Der Kanal wurde verifiziert. Sie können dieses Fenster schliessen.</p>',
                                  Set_Cookie='sonio_oauth=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
            except (httpx.HTTPError, ValueError, KeyError, OSError):
                # Provider responses may contain credentials; never display exceptions.
                print('Autorisierung konnte nicht verifiziert werden; kein Token gespeichert.', flush=True)
                return self.reply(400, '<h1>Verbindung nicht bestätigt</h1><p>Bitte beide Leserechte und den Sonio-Kanal auswählen. Den Assistenten für einen neuen Versuch neu starten.</p>')

    server = HTTPServer(('127.0.0.1', 8766), Handler)
    server.timeout = 1
    print('OAuth bereit: http://127.0.0.1:8766/start (30 Minuten)', flush=True)
    try:
        while time.monotonic() < deadline and not completed:
            server.handle_request()
    finally:
        server.server_close()


if __name__ == '__main__':
    main()

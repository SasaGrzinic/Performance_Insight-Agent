"""Conservative classification of explicit GA4 session sources, not AI visibility."""

from urllib.parse import urlparse

DOMAINS = {
    "chatgpt.com": "ChatGPT",
    "chat.openai.com": "ChatGPT",
    "perplexity.ai": "Perplexity",
    "gemini.google.com": "Gemini",
    "bard.google.com": "Gemini",
    "claude.ai": "Claude",
    "copilot.com": "Microsoft Copilot",
    "copilot.microsoft.com": "Microsoft Copilot",
    "chat.deepseek.com": "DeepSeek",
    "grok.com": "Grok",
}


def ai_provider(source):
    value = source.strip().lower()
    # Explicit domain only; google/bing/direct are not evidence of an AI referral.
    host = urlparse(value if "://" in value else "//" + value).hostname or ""
    for domain, provider in DOMAINS.items():
        if host == domain or host.endswith("." + domain):
            return provider
    return None


def summarize(rows):
    totals = {}
    evidence = []
    for row in rows:
        source = row["source"]
        provider = ai_provider(source)
        if provider:
            totals[provider] = totals.get(provider, 0) + row["sessions"]
            evidence.append({**row, "provider": provider})
    return {
        "providers": [
            {"label": k, "value": v} for k, v in sorted(totals.items(), key=lambda x: -x[1])
        ],
        "sessions": sum(totals.values()),
        "evidence": evidence,
    }

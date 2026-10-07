from app.ga4_ai_sources import ai_provider, summarize


def test_precise_domains_not_generic_search_or_substrings():
    assert ai_provider("chatgpt.com") == "ChatGPT"
    assert ai_provider("https://www.perplexity.ai/search") == "Perplexity"
    assert ai_provider("gemini.google.com") == "Gemini"
    for source in [
        "google",
        "bing.com",
        "(direct)",
        "notchatgpt.com",
        "chatgpt.com.evil.test",
        "openai.com",
    ]:
        assert ai_provider(source) is None


def test_aggregate_explicit_sources_once():
    result = summarize(
        [
            {"source": "chatgpt.com", "sessions": 4},
            {"source": "chat.openai.com", "sessions": 2},
            {"source": "google", "sessions": 10},
        ]
    )
    assert result["sessions"] == 6
    assert result["providers"] == [{"label": "ChatGPT", "value": 6}]
    assert len(result["evidence"]) == 2


def test_copilot_alias_and_claude_are_precise():
    assert ai_provider('copilot.com') == 'Microsoft Copilot'
    assert ai_provider('https://copilot.microsoft.com/') == 'Microsoft Copilot'
    assert ai_provider('claude.ai') == 'Claude'
    assert ai_provider('copilot.com.evil.test') is None
    assert ai_provider('bing') is None
    result = summarize([{'source': 'copilot.com', 'sessions': 8}, {'source': 'copilot.microsoft.com', 'sessions': 2}])
    assert result['providers'] == [{'label': 'Microsoft Copilot', 'value': 10}]

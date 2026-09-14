"""Written delivery on the real Discord surface.

A multi-line reply arrives as separate messages with "typing" between them, and
a `<think>` block is never written or spoken.
"""

import random

from src.core.expression.humanizer import TextHumanizer
from src.core.skills.voice.surface import VoiceSurface


class FakeTransport:
    """Records the calls the surface makes, and can be told to fail one."""

    def __init__(self, reply_ok: bool = True):
        self.sent = []
        self.replies = []
        self.typing_calls = []
        self.reply_ok = reply_ok
        self.edits = []
        self.deletions = []

    async def send_message(self, channel_id, content):
        self.sent.append((channel_id, content))
        return {"ok": True, "messageId": "sent-1"}

    async def reply_message(self, channel_id, message_id, content):
        self.replies.append((channel_id, message_id, content))
        return {"ok": self.reply_ok, "error": "unknown message"}

    async def typing(self, channel_id):
        self.typing_calls.append(channel_id)
        return {"ok": True}

    async def edit_message(self, channel_id, message_id, content):
        self.edits.append((channel_id, message_id, content))
        return {"ok": True}

    async def delete_message(self, channel_id, message_id):
        self.deletions.append((channel_id, message_id))
        return {"ok": True}


class Config:
    def __init__(self):
        self.skills = {"discord": {"enabled": True}}


def surface(reply_ok: bool = True) -> VoiceSurface:
    s = VoiceSurface(Config(), bus=None, expression=None)
    s.transport = FakeTransport(reply_ok=reply_ok)
    rng = random.Random()
    rng.uniform = lambda a, b: 1.0
    s.humanizer = TextHumanizer(sleep=_instant, rng=rng)
    s.active = True
    return s


async def _instant(seconds):
    return None


async def test_a_multiline_reply_arrives_as_separate_messages():
    s = surface()
    result = await s._tool_send_message("123", "ma stai scherzando\nseriamente?")
    assert [c for _, c in s.transport.sent] == ["ma stai scherzando", "seriamente?"]
    assert "2 message(s)" in result


async def test_typing_is_shown_between_messages():
    s = surface()
    await s._tool_send_message("123", "uno\ndue\ntre")
    assert s.transport.typing_calls == ["123", "123", "123"]


async def test_only_the_first_chunk_quotes_their_message():
    s = surface()
    await s._tool_reply("123", "msg-9", "prima riga\nseconda riga")
    assert s.transport.replies == [("123", "msg-9", "prima riga")]
    assert [c for _, c in s.transport.sent] == ["seconda riga"]


async def test_a_deleted_message_falls_back_to_a_plain_send():
    s = surface(reply_ok=False)
    result = await s._tool_reply("123", "gone", "ci sei?")
    assert [c for _, c in s.transport.sent] == ["ci sei?"]
    assert "1 message(s)" in result


async def test_emit_text_routes_through_the_humanizer():
    s = surface()
    sent = await s.emit_text("una\ndue", meta={"channel_id": "77"})
    assert sent == ["una", "due"]


async def test_emit_text_without_a_channel_does_nothing():
    s = surface()
    assert await s.emit_text("ciao", meta={}) == []
    assert s.transport.sent == []


async def test_discord_can_edit_and_delete_messages():
    s = surface()
    assert await s._tool_edit_message("123", "m1", "corretto") == "Edited."
    assert await s._tool_delete_message("123", "m1") == "Deleted."
    assert s.transport.edits == [("123", "m1", "corretto")]
    assert s.transport.deletions == [("123", "m1")]


async def test_discord_tracks_its_latest_message():
    s = surface()
    assert await s.send_text("123", "hello")
    assert await s._tool_edit_last_message("123", "edited") == "Edited."
    assert await s._tool_delete_last_message("123") == "Deleted."

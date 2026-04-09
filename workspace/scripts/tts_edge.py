#!/usr/bin/env python3
"""Simple edge-tts for OpenClaw"""

import asyncio
from edge_tts import Communicate
import argparse

async def generate_speech(text, output_file, voice=None):
    """Generate speech using edge-tts"""
    if voice is None:
        # Check for Japanese first (hiragana/katakana)
        has_japanese = any('\u3040' <= c <= '\u309f' or '\u30a0' <= c <= '\u30ff' for c in text)
        # Check for Chinese characters
        has_chinese = any('\u4e00' <= c <= '\u9fff' for c in text)
        
        if has_japanese:
            voice = "ja-JP-NanamiNeural"  # Japanese
        elif has_chinese:
            voice = "zh-CN-XiaoxiaoNeural"  # Chinese
        else:
            voice = "en-US-AriaNeural"  # English default
    
    communicate = Communicate(text, voice)
    await communicate.save(output_file)
    return output_file

def main():
    parser = argparse.ArgumentParser(description='Edge TTS for OpenClaw')
    parser.add_argument('text', help='Text to speak')
    parser.add_argument('voice', nargs='?', default=None, help='Voice to use')
    parser.add_argument('-o', '--output', default='/tmp/tts_output.mp3', help='Output file')
    parser.add_argument('-s', '--speed', default='+0%', help='Speed adjustment')
    
    args = parser.parse_args()
    
    asyncio.run(generate_speech(args.text, args.output, args.voice))
    print(f"MEDIA:{args.output}")

if __name__ == "__main__":
    main()

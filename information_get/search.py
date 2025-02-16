import os
from typing import Dict, Optional
import httpx
from datetime import datetime
import re


class PerplexityAI:
    def __init__(self):
        self.api_key = os.getenv("PEPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def ask_question(self, query: str, context: Optional[str] = None) -> Dict:
        try:
            async with httpx.AsyncClient() as client:
                messages = []

                messages.append(
                    {
                        "role": "system",
                        "content": "你是一个专业的AI助手，擅长信息搜索和验证。请提供准确、客观的回答。",
                    }
                )

                if context:
                    messages.append(
                        {"role": "system", "content": f"Context: {context}"}
                    )
                    messages.append(
                        {
                            "role": "assistant",
                            "content": "我已经理解了上下文信息，请继续提问。",
                        }
                    )

                messages.append({"role": "user", "content": query})

                payload = {
                    "model": "sonar",
                    "messages": messages,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "stream": False,
                    "presence_penalty": 0.0,
                    "frequency_penalty": 1.0,
                }

                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0,
                )

                if response.status_code == 200:
                    result = response.json()
                    answer = result["choices"][0]["message"]["content"]

                    sources = []
                    url_pattern = r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+"
                    urls = re.findall(url_pattern, answer)

                    seen = set()
                    sources = [
                        url for url in urls if not (url in seen or seen.add(url))
                    ]

                    return {
                        "answer": answer,
                        "model": result["model"],
                        "timestamp": datetime.now().isoformat(),
                        "status": "success",
                        "citations": result.get("citations", []),
                        "sources": sources,
                    }
                else:
                    return {
                        "error": f"API请求失败: {response.status_code}, 响应: {response.text}",
                        "status": "error",
                    }

        except Exception as e:
            return {"error": f"发生错误: {str(e)}", "status": "error"}

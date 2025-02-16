import os
import json
import httpx
from typing import Dict, List, Optional
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class PerplexityAI:
    def __init__(self):
        self.api_key = os.getenv("PEPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def ask_question(self, query: str, context: Optional[str] = None) -> Dict:
        """
        使用Perplexity AI发送问题并获取回答

        Args:
            query: 用户的问题
            context: 可选的上下文信息

        Returns:
            Dict: 包含AI回答的字典
        """
        try:
            async with httpx.AsyncClient() as client:
                messages = []

                # 添加系统消息
                messages.append(
                    {
                        "role": "system",
                        "content": "你是一个专业的AI助手，擅长信息搜索和验证。请提供准确、客观的回答。",
                    }
                )

                # 如果有上下文，添加到消息中
                if context:
                    messages.append(
                        {"role": "user", "content": f"上下文信息：{context}"}
                    )
                    messages.append(
                        {
                            "role": "assistant",
                            "content": "我已经理解了上下文信息，请继续提问。",
                        }
                    )

                # 添加用户问题
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

                # 打印请求内容以便调试
                print(
                    "Request payload:",
                    json.dumps(payload, ensure_ascii=False, indent=2),
                )

                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0,
                )

                # 打印响应内容以便调试
                print("Response status:", response.status_code)
                print("Response content:", response.text)

                if response.status_code == 200:
                    result = response.json()
                    return {
                        "answer": result["choices"][0]["message"]["content"],
                        "model": result["model"],
                        "timestamp": datetime.now().isoformat(),
                        "status": "success",
                        "citations": result.get("citations", []),
                    }
                else:
                    return {
                        "error": f"API请求失败: {response.status_code}, 响应: {response.text}",
                        "status": "error",
                    }

        except Exception as e:
            return {"error": f"发生错误: {str(e)}", "status": "error"}

    async def search_and_answer(self, query: str) -> Dict:
        """
        搜索相关信息并回答问题

        Args:
            query: 用户的问题

        Returns:
            Dict: 包含搜索结果和回答的字典
        """
        try:
            # 首先进行搜索
            search_prompt = f"请搜索关于以下问题的最新信息：{query}"
            search_result = await self.ask_question(search_prompt, context=None)

            if search_result["status"] == "error":
                return search_result

            # 使用搜索结果作为上下文来回答问题
            answer = await self.ask_question(query, context=search_result["answer"])

            return {
                "search_result": search_result["answer"],
                "final_answer": (
                    answer["answer"] if answer["status"] == "success" else None
                ),
                "citations": search_result.get("citations", [])
                + answer.get("citations", []),
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

        except Exception as e:
            return {"error": f"搜索和回答过程中发生错误: {str(e)}", "status": "error"}


# 使用示例
async def main():
    ai = PerplexityAI()

    # 示例问题
    question = "LIBRA是什么"

    # 获取回答
    result = await ai.search_and_answer(question)

    if result["status"] == "success":
        print("\n搜索结果:")
        print(result["search_result"])
        print("\n最终回答:")
        print(result["final_answer"])
        if result["citations"]:
            print("\n信息来源:")
            for citation in result["citations"]:
                print(f"- {citation}")
    else:
        print("发生错误:", result["error"])


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())

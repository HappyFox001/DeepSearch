import os
from typing import Dict, List
from datetime import datetime
from openai import OpenAI
from prompt import SMART_COMMENT_PROMPT, ANALYSIS_PROMPT, ANALYSIS_USER_PROMPT
from dotenv import load_dotenv
from search import PerplexityAI

# 加载环境变量
load_dotenv()


class Chatbot:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.perplexity = PerplexityAI()

    async def process_query(self, user_input: str) -> Dict:
        try:
            refined = await self.refine_question(user_input)
            if "error" in refined:
                return refined

            search_results = []
            for query in refined["search_queries"]:
                result = await self.perplexity.ask_question(query)
                if result["status"] == "success":
                    search_results.append(result["answer"])

            if not search_results:
                return {"error": "搜索未返回任何结果", "status": "error"}

            final_response = await self.analyze_results(user_input, search_results)
            thought_process, final_answer = (
                final_response["thought_process"],
                final_response["answer"],
            )
            print("original_question:\n", user_input)
            print("=" * 50)
            print("search_queries:\n", refined["search_queries"])
            print("=" * 50)
            print("search_results:\n", search_results)
            print("=" * 50)
            print("refined_thinking_process:\n", refined["thinking_process"])
            print("=" * 50)
            print("thinking_process:\n", thought_process)
            print("=" * 50)
            print("final_answer:\n", final_answer)
            print("=" * 50)
            print("citations:\n", refined.get("citations", []))
            print("=" * 50)
            print(
                "timestamp:\n",
                datetime.now().isoformat(),
            )
            return {
                "status": "success",
                "original_question": user_input,
                "refined_questions": refined["search_queries"],
                "search_results": search_results,
                "refined_thinking_process": refined["thinking_process"],
                "thinking_process": thought_process,
                "final_answer": final_answer,
                "citations": refined.get("citations", []),
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            return {"error": f"处理查询时发生错误: {str(e)}", "status": "error"}

    async def refine_question(self, content: str) -> Dict:
        """
        使用GPT-4细化用户的问题
        """
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": "你是一个专业的问题分析专家，擅长将模糊的问题转化为具体的搜索查询。",
                    },
                    {
                        "role": "user",
                        "content": SMART_COMMENT_PROMPT.format(content=content),
                    },
                ],
                temperature=0.7,
                max_tokens=1000,
                top_p=0.95,
            )

            result = response.choices[0].message.content.strip()
            parts = result.split("===")
            if len(parts) < 2:
                return {"error": "无法解析GPT-4的输出", "status": "error"}

            thinking_process = parts[0].strip()
            search_part = parts[1].strip()

            search_queries = []
            for line in search_part.split("\n"):
                if (
                    line.startswith("1.")
                    or line.startswith("2.")
                    or line.startswith("3.")
                ):
                    search_queries.append(line.split(".", 1)[1].strip())

            return {
                "status": "success",
                "thinking_process": thinking_process,
                "search_queries": search_queries,
            }

        except Exception as e:
            return {"error": f"细化问题时发生错误: {str(e)}", "status": "error"}

    async def analyze_results(
        self, original_question: str, search_results: List[str]
    ) -> Dict:
        try:
            combined_results = "\n\n".join(search_results)

            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": ANALYSIS_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": ANALYSIS_USER_PROMPT.format(
                            original_question=original_question,
                            combined_results=combined_results,
                        ),
                    },
                ],
                temperature=0.7,
                max_tokens=1500,
                top_p=0.95,
            )

            full_response = response.choices[0].message.content.strip()
            parts = full_response.split("===")

            thought_process = parts[0].strip() if len(parts) > 1 else ""
            final_answer = parts[1].strip() if len(parts) > 1 else full_response

            return {
                "status": "success",
                "answer": final_answer,
                "thought_process": thought_process,
            }

        except Exception as e:
            return {"error": f"分析结果时发生错误: {str(e)}", "status": "error"}


def print_colored(text, color_code):
    print(f"\033[{color_code}m{text}\033[0m")


def get_multiline_input():
    print_colored("请输入您的问题（输入完成后按两次回车结束）：", "1;32")
    lines = []
    while True:
        line = input()
        if not line and (not lines or not lines[-1]):  # 连续两次空行
            break
        lines.append(line)
    return "\n".join(lines).strip()


async def main():
    print_colored("欢迎使用智能信息搜索系统！", "1;36")
    print_colored("输入 'q' 或 'quit' 退出程序", "1;33")
    print_colored("输入内容后按两次回车提交", "1;33")

    chatbot = Chatbot()

    while True:
        user_input = get_multiline_input()

        if user_input.lower() in ["q", "quit"]:
            print_colored("\n感谢使用！再见！", "1;36")
            break

        if not user_input:
            print_colored("问题不能为空，请重新输入！", "1;31")
            continue

        print_colored("\n正在处理您的问题...", "1;33")

        result = await chatbot.process_query(user_input)

        if result["status"] == "error":
            print_colored(f"发生错误：{result['error']}", "1;31")
            continue

        print_colored("\n问题分析：", "1;35")
        for i, query in enumerate(result["refined_questions"], 1):
            print(f"{i}. {query}")

        print_colored("\n搜索结果：", "1;35")
        for i, search_result in enumerate(result["search_results"], 1):
            print(f"\n结果 {i}:")
            print(search_result)

        print_colored("\n思维链路：", "1;35")
        print(result["thinking_process"])
        print_colored("\n最终回答：", "1;35")
        print(result["final_answer"])

        if result.get("citations"):
            print_colored("\n信息来源：", "1;33")
            for citation in result["citations"]:
                print(f"- {citation}")

        print_colored("\n" + "=" * 50, "1;33")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())

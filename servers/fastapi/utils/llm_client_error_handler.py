from fastapi import HTTPException
from anthropic import APIError as AnthropicAPIError
from openai import APIError as OpenAIAPIError, APITimeoutError as OpenAITimeoutError
from google.genai.errors import APIError as GoogleAPIError
import httpx
import traceback


def handle_llm_client_exceptions(e: Exception) -> HTTPException:
    traceback.print_exc()
    
    error_str = str(e).lower()
    error_msg = str(e)
    
    # 处理连接超时错误
    if isinstance(e, (httpx.ConnectTimeout, httpx.ConnectError)):
        return HTTPException(
            status_code=503,
            detail=f"无法连接到LLM服务器。请检查：1) LLM服务器是否正在运行 2) 网络连接是否正常 3) URL配置是否正确。错误详情: {error_msg}"
        )
    
    # 处理请求超时错误
    if isinstance(e, (httpx.ReadTimeout, OpenAITimeoutError)) or "timeout" in error_str:
        return HTTPException(
            status_code=504,
            detail=f"LLM服务器响应超时。这可能是由于服务器负载过高或请求过于复杂。请稍后重试。错误详情: {error_msg}"
        )
    
    # 处理连接错误
    if "connection" in error_str or "connect" in error_str:
        return HTTPException(
            status_code=503,
            detail=f"LLM服务器连接失败。请检查服务器地址和网络设置。错误详情: {error_msg}"
        )
    
    # 处理API错误
    if isinstance(e, OpenAIAPIError):
        return HTTPException(status_code=500, detail=f"OpenAI API error: {error_msg}")
    if isinstance(e, GoogleAPIError):
        return HTTPException(status_code=500, detail=f"Google API error: {error_msg}")
    if isinstance(e, AnthropicAPIError):
        return HTTPException(
            status_code=500, detail=f"Anthropic API error: {error_msg}"
        )
    
    return HTTPException(status_code=500, detail=f"LLM API error: {error_msg}")

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd

from src.data.data_loader import load_and_clean_data
from src.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# In-memory dataframe caching for performance
# In a real heavy-load scenario, you'd query the DB or use a SQLAgent
_df = None

def get_df():
    global _df
    if _df is None:
        data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "OnlineRetail.csv")
        try:
            _df = load_and_clean_data(data_path)
        except Exception as e:
            print("Error loading data:", e)
            _df = pd.DataFrame() # Fallback to empty
    return _df

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str


def _env_flag(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@router.post("/", response_model=ChatResponse)
async def chat_with_data(request: ChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(
            status_code=400,
            detail="GROQ_API_KEY is missing in backend environment. Add it to .env and restart the API server.",
        )
        
    try:
        from langchain_experimental.agents.agent_toolkits.pandas.base import create_pandas_dataframe_agent
        from langchain_groq import ChatGroq
        
        # Initialize LangChain agent
        llm = ChatGroq(temperature=0, model="llama-3.3-70b-versatile", groq_api_key=groq_api_key)
        
        df = get_df()
        if df.empty:
            raise Exception("Dataset is empty or could not be loaded.")
            
        allow_dangerous = _env_flag("CHAT_ALLOW_DANGEROUS_CODE", default=False)
        if not allow_dangerous:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Chat is disabled by security policy. Set CHAT_ALLOW_DANGEROUS_CODE=true "
                    "for trusted local development if you want pandas-agent chat enabled."
                ),
            )

        agent = create_pandas_dataframe_agent(
            llm, 
            df,
            verbose=False,
            agent_type="tool-calling",
            allow_dangerous_code=allow_dangerous
        )

        response = agent.invoke({"input": request.message})
        return ChatResponse(response=response.get("output", str(response)))

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Chat invocation failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Chat assistant failed: {exc}")

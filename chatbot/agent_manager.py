import os  
import logging
import pandas as pd

from typing import TypedDict, List 
from langchain_openai import ChatOpenAI 
from langgraph.graph import StateGraph
from agent_document import AgentDocument
from agent_internet import AgentInternet 
from langchain_core.prompts import PromptTemplate  
from pathlib import Path



CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR)))

DATALAKE_DIR = os.path.join(PROJECT_ROOT, "projeto_srag_agents","datalake")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "projeto_srag_agents","output")


class ManagerState(TypedDict):
    question: str 
    retrived_docs: str 
    internet_results: str
    answer: str


class Manager: 
    """ 
    Agent role with manager the work of Document Agent and Internet Agent to answer questions about public respiratory diseases and medications.
    """

    def __init__(self, path):
        self.agent_document = AgentDocument(path)
        self.agent_internet = AgentInternet(3) 
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5) 
        self.graph = self.build_graph() 

    def build_graph(self) -> StateGraph:  
        graph = StateGraph(ManagerState) 

        graph.add_node("retrieve", self.agent_document.create_new_state) 
        graph.add_node("internet", self.agent_internet.fetch_information)
        graph.add_node("answer", self.answer_node)  

        graph.set_entry_point("retrieve")
        graph.add_edge("retrieve", "answer") 
        graph.add_edge("internet", "answer")
        graph.set_finish_point("answer") 
        
        logging.info("Manager graph built successfully with nodes: retrieve, internet, answer.")

        return graph.compile() 

    def answer_node(self, state: ManagerState) -> ManagerState:
        prompt_template = """Você é um agente especiliasta em análise hídrica de uma residência e tem grande conhecimento sobre vazão  
        de água na tubulação de uma residência, problemas na tubulação e ocorrência de falta de água. Você deve verificar os hídricos  
        da residência e fazer pesquisas na Internet utilizando as informações abaixo,  
        gere uma resposta detalhada para a pergunta do usuário.
                Informações recuperadas do banco de dados:
                {retrived_docs}

                Informações recuperadas da Internet:
                {internet_results}

                Pergunta do usuário:
                {question}

        Responda de forma clara e objetiva, utilizando as informações acima como base para sua resposta.
        """    
        prompt = PromptTemplate(
            input_variables=["question", "retrived_docs", "internet_results"],
            template=prompt_template
        )

        prompt_filled = prompt.format(
            question=state["question"],
            retrived_docs="\n".join(state["retrived_docs"]),
            internet_results=state.get("internet_results","")
        )

        response = self.llm.invoke(prompt_filled)

        logging.info("Generated answer using LLM based on retrieved documents and internet results and built one prompt with role and information for Manager Agent.")

        return {**state, "answer": response.content}  
    
    def run_agent(self, question: str) -> str:
        initial_state: ManagerState = {
            "question": question,
            "retrived_docs": "",
            "internet_results": "",
            "answer": ""
        }

        final_state = self.graph.invoke(initial_state)

       
        df_path =  Path("C:/Users/DELL/Documents/Projeto_Smart_Pipe/smart-pipe-backend/smart-pipe/dados_recebidos.csv")
    
        logging.info("Generated visualizations for the last 30 days and last 12 months.")


        return final_state["answer"]
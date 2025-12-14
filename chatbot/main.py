import os
from agent_manager import Manager
from pathlib import Path


# Use forward slashes or Path to avoid any escape-sequence interpretation in
# Windows paths. Passing a `str` to Manager to keep compatibility.
PATH = Path("C:/Users/DELL/Documents/Projeto_Smart_Pipe/smart-pipe-backend/smart-pipe/dados_recebidos.csv")

question = input("Digite a pergunta: ")

manager = Manager(path=str(PATH))
resposta = manager.run_agent(question)
print(resposta)

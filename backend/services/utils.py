# backend/services/utils.py
import random
import string

#Gera o pin aleatorio
def gerar_pin():
    return ''.join(random.choices(string.digits, k=6))
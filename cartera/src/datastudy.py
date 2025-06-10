import requests

# URL del endpoint
url = "https://kth2025backend-production.up.railway.app/todo"

# Hacer la solicitud GET
response = requests.get(url)

# Verificar que la respuesta sea exitosa
if response.status_code == 200:
    data = response.json()  # Convertir la respuesta en JSON
    print("Datos recibidos:")
    print(data)

    print("\nCampos que toleran valores nulos (detectados en la data):\n")

    campos_con_nulos = set()

    # Obtener la lista de registros
    registros = data.get("data", [])

    # Revisar cada registro
    for registro in registros:
        for campo, valor in registro.items():
            if valor is None:
                campos_con_nulos.add(campo)

    if campos_con_nulos:
        print("Los siguientes campos tienen al menos un valor NULL en la data:")
        for campo in campos_con_nulos:
            print(f"- {campo}")
    else:
        print("No se encontraron valores NULL en los datos.")
else:
    print(f"Error al obtener los datos. Código de estado: {response.status_code}")

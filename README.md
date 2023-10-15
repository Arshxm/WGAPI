# WGAPI
This API simplifies the generation of WireGuard client configurations with customizable settings. It allows you to create configurations for multiple clients, each with unique addresses, DNS settings, and endpoints, all based on your WireGuard server details.

### WireGuard Configuration API

This API allows you to generate and manage WireGuard client configurations with custom addresses based on the provided server IP. You can specify the number of clients, server details, and additional configuration parameters.

**Base URL**: Replace `http://localhost:8000` with the actual URL where your API is hosted.

#### Generate WireGuard Configurations

- **URL**: `/generate-config`
- **Method**: POST
- **Description**: Generate WireGuard client configurations with custom addresses based on the provided server IP.
- **Request Body**:
  - `numberOfClients` (number): The number of client configurations to generate.
  - `serverPublicKey` (string): The public key of the WireGuard server.
  - `serverIP` (string): The IP address of the WireGuard server.
  - `allowedIP` (string): The allowed IP addresses for clients.
  - `dns` (string): The DNS server for the client.
  - `endpoint` (string): The WireGuard endpoint for the client.

**Example Request Body**:
```json
{
  "numberOfClients": 10,
  "serverPublicKey": "SERVER_PUBLIC_KEY",
  "serverIP": "11.34.13.10",
  "allowedIP": "10.0.0.2/32",
  "dns": "8.8.8.8",
  "endpoint": "SERVER_ENDPOINT:51820"
}
```

**Response**:
- Status: 200 OK
- Content: An array of client configurations, each with the client index, public key, and configuration details.

**Example Response**:
```json
{
  "clientConfigs": [
    {
      "clientIndex": 1,
      "publicKey": "CLIENT_PUBLIC_KEY_1",
      "config": "Client 1 Configuration..."
    },
    {
      "clientIndex": 2,
      "publicKey": "CLIENT_PUBLIC_KEY_2",
      "config": "Client 2 Configuration..."
    },
    // ... (Configurations for other clients)
  ]
}
```

#### Download WireGuard Configuration

- **URL**: `/download-config/:clientIndex?`
- **Method**: GET
- **Description**: Download the WireGuard configuration for a specific client or all client configurations.
- **URL Parameters**:
  - `clientIndex` (optional): The index of the client configuration to download. If not provided, all client configurations will be returned.

**Example Request URL**:
- Download configuration for a specific client:
  - `/download-config/1`

- Download all client configurations:
  - `/download-config`

**Response**:
- Status: 200 OK
- Content: The WireGuard client configuration file for the specified client.

**Error Responses**:
- Status: 404 Not Found
- Content: Error message indicating that the client configuration was not found.

**Example Error Response**:
```json
{
  "error": "Client configuration not found"
}
```

### Usage Instructions

1. Start the API by running the Node.js server.
2. Use the `/generate-config` endpoint to generate client configurations. Provide the necessary input parameters, including the number of clients, server details, allowed IP addresses, DNS, and endpoint.
3. The API will generate the WireGuard configurations, and the last octet of the client addresses will increment for each new configuration.
4. You can use the `/download-config` endpoint to download individual client configurations or the entire list of client configurations.

Replace placeholders such as `SERVER_PUBLIC_KEY` and `SERVER_ENDPOINT` with your actual data.


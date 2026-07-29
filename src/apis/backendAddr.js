const hostname = window.location.hostname
const port = window.location.port

export const webSocketAddr = 'ws://' + hostname + ':' + port
export const httpAddr = 'http://' + hostname + ':' + port

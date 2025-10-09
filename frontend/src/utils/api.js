const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export async function getHello() {
    const res = await fetch(`${API_BASE}/hello`);
    return res.text();
}
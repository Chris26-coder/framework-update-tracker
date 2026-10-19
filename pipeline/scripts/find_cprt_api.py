import httpx

url = "https://csrc.nist.gov/extensions/nudppublic/main.js"
resp = httpx.get(url, timeout=30)
text = resp.text

idx = 0
while True:
    pos = text.find("service/rest/json/nudp/framework/version/", idx)
    if pos == -1:
        break
    snippet = text[max(0, pos - 50): min(len(text), pos + 200)]
    print(f"Occurrence at {pos}:\n  {snippet}\n")
    idx = pos + 1

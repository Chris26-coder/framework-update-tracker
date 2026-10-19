import httpx

r = httpx.get('https://csrc.nist.gov/extensions/nudp/services/json/nudp/framework/metadata')
fws = r.json()['cprt']['frameworks']
for f in fws:
    name = f.get('name', '')
    for v in f.get('frameworkVersionList', []):
        v_name = v.get('name', '')
        v_id = v.get('frameworkVersionIdentifier', '')
        version = v.get('version', '')
        # Check for CSF 2.0, 800-171, Privacy
        if ('cybersecurity framework' in name.lower() or 'csf' in name.lower() or '171' in name.lower() or 'privacy' in name.lower()) and not ('to-' in name.lower() or ' to ' in name.lower()):
            print(f'Candidate: name="{name}" | v_name="{v_name}" | version="{version}" | frameworkVersionIdentifier="{v_id}"')

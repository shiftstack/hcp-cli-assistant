import './App.css'

export default function HcpCliAssistant() {
  const steps = [
    "Cluster Details",
    "OpenStack Authentication",
    "Networking",
    "Node Configuration",
    "Review & Generate Command"
  ];

  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    baseDomain: "",
    nodePoolReplicas: "",
    pullSecret: "",
    sshKey: "",
    osCloudSet: true,
    openstackCredentialsFile: "",
    openstackCaCertFile: "",
    openstackCloud: "",
    externalNetworkId: "",
    ingressFloatingIp: "",
    nodeFlavor: "",
    nodeAZ: "",eaeae
    nodeImageName: "",
    dnsNameservers: "",
    additionalPorts: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 0:
        return form.name.trim() !== "" && form.baseDomain.trim() !== "" && form.nodePoolReplicas.trim() !== "" && form.pullSecret.trim() !== "" && form.sshKey.trim() !== "";
      case 1:
        return form.osCloudSet || form.openstackCredentialsFile.trim() !== "";
      case 2:
        if (form.additionalPorts) {
          try {
            const ports = JSON.parse(form.additionalPorts);
            return ports.every((port) => port.networkId.trim() !== "");
          } catch (e) {
            return false;
          }
        }
        return true;
      case 3:
        return form.nodeFlavor.trim() !== "";
      default:
        return true;
    }
  };

  const generateCommand = () => {
    let cmd = `hcp create cluster openstack \
      --name ${form.name} \
      --base-domain ${form.baseDomain} \
      --node-pool-replicas ${form.nodePoolReplicas} \
      --pull-secret ${form.pullSecret} \
      --ssh-key ${form.sshKey}`;

    if (!form.osCloudSet) {
      cmd += ` \
      --openstack-credentials-file ${form.openstackCredentialsFile}`;
    }
    if (form.openstackCaCertFile) {
      cmd += ` \
      --openstack-ca-cert-file ${form.openstackCaCertFile}`;
    }
    if (form.openstackCloud) {
      cmd += ` \
      --openstack-cloud ${form.openstackCloud}`;
    }
    if (form.externalNetworkId) {
      cmd += ` \
      --openstack-external-network-id ${form.externalNetworkId}`;
    }
    if (form.ingressFloatingIp) {
      cmd += ` \
      --openstack-ingress-floating-ip ${form.ingressFloatingIp}`;
    }
    cmd += ` \
      --openstack-node-flavor ${form.nodeFlavor}`;

    if (form.dnsNameservers) {
      cmd += ` \
      --openstack-dns-nameservers ${form.dnsNameservers}`;
    }

    if (form.nodeAZ) {
      cmd += ` \
      --openstack-node-availability-zone ${form.nodeAZ}`;
    }

    if (form.nodeImageName) {
      cmd += ` \
      --openstack-node-image-name ${form.nodeImageName}`;
    }

    if (form.additionalPorts) {
      const ports = JSON.parse(form.additionalPorts);
      ports.forEach((port, index) => {
      let portConfig = `--openstack-node-additional-port=network-id:${port.networkId}`;
      
      if (port.vnicType) {
        portConfig += `,vnic-type:${port.vnicType}`;
      }
      
      if (port.addressPairs) {
        portConfig += `,address-pairs:${port.addressPairs}`;
      }
      
      if (port.disablePortSecurity) {
        portConfig += `,disable-port-security:true`;
      }
      
      cmd += ` \
      ${portConfig}`;
      });
    }

    cmd = cmd.replace(/\s+/g, ' ').trim();

    return cmd;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextStep = () => {
    if (isStepValid()) {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));
aefea
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">HCP CLI Assistant</h1>
      <h2 className="text-lg font-semibold">Step {step + 1}: {steps[step]}</h2>

      {step === 4 ? (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-lg font-bold">Generated Command:</h2>
          <pre className="p-2 bg-black text-white border rounded whitespace-pre-wrap">{generateCommand()}</pre>
          <button
            className={`mt-2 p-2 rounded text-white`}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy Command"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {step === 0 && <>
            <input type="text" name="name" placeholder="Cluster Name (required). Example: test" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input type="text" name="baseDomain" placeholder="Base Domain (required). Example: mydomain.com" value={form.baseDomain} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input type="number" name="nodePoolReplicas" placeholder="Node Pool Replicas (required)" value={form.nodePoolReplicas} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input type="text" name="pullSecret" placeholder="Pull Secret path (required). Example: /path/to/pull-secret" value={form.pullSecret} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input type="text" name="sshKey" placeholder="SSH Key path (required). Example: /path/to/id_rsa.pub" value={form.sshKey} onChange={handleChange} className="w-full p-2 border rounded" required />
          </>}
          {step === 1 && <><label className="block"><input type="checkbox" name="osCloudSet" checked={form.osCloudSet} onChange={handleChange} className="mr-2" />OS_CLOUD is set in the environment</label>{!form.osCloudSet && (
            <>
              <input type="text" name="openstackCredentialsFile" placeholder="OpenStack Credentials File (optional). Example: /path/to/clouds.yaml" value={form.openstackCredentialsFile} onChange={handleChange} className="w-full p-2 border rounded" />
            </>
          )}
          <input type="text" name="openstackCloud" placeholder="OpenStack Cloud (optional). Default: openstack" value={form.openstackCloud} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="text" name="openstackCaCertFile" placeholder="OpenStack CA Certificate File (optional). Example: /path/to/ca.cert" value={form.openstackCaCertFile} onChange={handleChange} className="w-full p-2 border rounded" /></>}
          {step === 2 && (
            <>
              <input type="text" name="externalNetworkId" placeholder="External Network ID (optional). Example: 64f629fd-f75b-4e66-96ad-94f6f2125ba4" value={form.externalNetworkId} onChange={handleChange} className="w-full p-2 border rounded" />
              <input type="text" name="ingressFloatingIp" placeholder="Ingress Floating IP (optional). Example: 192.168.100.7" value={form.ingressFloatingIp} onChange={handleChange} className="w-full p-2 border rounded" />
              <input type="text" name="dnsNameservers" placeholder="DNS Nameservers (optional). Example: 1.1.1.1,8.8.8.8" value={form.dnsNameservers} onChange={handleChange} className="w-full p-2 border rounded" />
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Additional Nodepool Ports (optional)</h3>
                {form.additionalPorts && JSON.parse(form.additionalPorts).map((port, index) => (
                  <div key={index} className="p-3 border rounded mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Port {index + 1}</span>
                      <button 
                        onClick={() => {
                          const ports = JSON.parse(form.additionalPorts);
                          ports.splice(index, 1);
                          setForm({
                            ...form,
                            additionalPorts: JSON.stringify(ports)
                          });
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm">Network ID (required)</label>
                        <input 
                          type="text" 
                          value={port.networkId || ""} 
                          onChange={(e) => {
                            const ports = JSON.parse(form.additionalPorts);
                            ports[index].networkId = e.target.value;
                            setForm({
                              ...form,
                              additionalPorts: JSON.stringify(ports)
                            });
                          }}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm">VNIC Type (optional)</label>
                        <input 
                          type="text" 
                          value={port.vnicType || ""} 
                          onChange={(e) => {
                            const ports = JSON.parse(form.additionalPorts);
                            ports[index].vnicType = e.target.value;
                            setForm({
                              ...form,
                              additionalPorts: JSON.stringify(ports)
                            });
                          }}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm">Address Pairs (optional)</label>
                        <input 
                          type="text" 
                          value={port.addressPairs || ""} 
                          onChange={(e) => {
                            const ports = JSON.parse(form.additionalPorts);
                            ports[index].addressPairs = e.target.value;
                            setForm({
                              ...form,
                              additionalPorts: JSON.stringify(ports)
                            });
                          }}
                          className="w-full p-2 border rounded"
                          placeholder="ip_address=mac_address,ip_address=mac_address"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center text-sm">
                          <input 
                            type="checkbox" 
                            checked={port.disablePortSecurity || false} 
                            onChange={(e) => {
                              const ports = JSON.parse(form.additionalPorts);
                              ports[index].disablePortSecurity = e.target.checked;
                              setForm({
                                ...form,
                                additionalPorts: JSON.stringify(ports)
                              });
                            }}
                            className="mr-2"
                          />
                          Disable Port Security
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const ports = form.additionalPorts ? JSON.parse(form.additionalPorts) : [];
                    ports.push({ networkId: "" });
                    setForm({
                      ...form,
                      additionalPorts: JSON.stringify(ports)
                    });
                  }}
                  className="mt-2 px-3 py-2 bg-green-500 text-white rounded"
                >
                  Add Port
                </button>
              </div>
            </>
          )}
          {step === 3 && <><input type="text" name="nodeFlavor" placeholder="Flavor name for the Nodepool (Required)" value={form.nodeFlavor} onChange={handleChange} className="w-full p-2 border rounded" required /><input type="text" name="nodeAZ" placeholder="Nova Availability Zone (optional)" value={form.nodeAZ} onChange={handleChange} className="w-full p-2 border rounded" /><input type="text" name="nodeImageName" placeholder="Glance Image Name (optional)" value={form.nodeImageName} onChange={handleChange} className="w-full p-2 border rounded" /></>}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        {step > 0 && <button onClick={prevStep} className="p-2 bg-gray-500 text-white rounded">Previous</button>}
        {step < steps.length - 1 && <button onClick={nextStep} disabled={!isStepValid()} className={`p-2 rounded ${isStepValid() ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>Next</button>}
      </div>
    </div>
  );
}

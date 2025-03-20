import './App.css'
import React, { useState } from "react";

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
    openstackCloud: "openstack",
    externalNetworkId: "",
    ingressFloatingIp: "",
    nodeFlavor: "",
    dnsNameservers: "",
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
        return form.name.trim() !== "" && form.baseDomain.trim() !== "" && form.nodePoolReplicas.trim() !== "";
      case 1:
        return form.osCloudSet || form.openstackCredentialsFile.trim() !== "";
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
    if (form.openstackCloud !== "openstack") {
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
          {step === 0 && <><input type="text" name="name" placeholder="Cluster Name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required /><input type="text" name="baseDomain" placeholder="Base Domain" value={form.baseDomain} onChange={handleChange} className="w-full p-2 border rounded" required /><input type="number" name="nodePoolReplicas" placeholder="Node Pool Replicas" value={form.nodePoolReplicas} onChange={handleChange} className="w-full p-2 border rounded" required /></>}
          {step === 1 && <><label className="block"><input type="checkbox" name="osCloudSet" checked={form.osCloudSet} onChange={handleChange} className="mr-2" />OS_CLOUD is set in the environment</label>{!form.osCloudSet && <input type="text" name="openstackCredentialsFile" placeholder="OpenStack Credentials File" value={form.openstackCredentialsFile} onChange={handleChange} className="w-full p-2 border rounded" required />}</>}
          {step === 2 && <><input type="text" name="externalNetworkId" placeholder="External Network ID" value={form.externalNetworkId} onChange={handleChange} className="w-full p-2 border rounded" /><input type="text" name="ingressFloatingIp" placeholder="Ingress Floating IP" value={form.ingressFloatingIp} onChange={handleChange} className="w-full p-2 border rounded" /><input type="text" name="dnsNameservers" placeholder="DNS Nameservers (comma-separated)" value={form.dnsNameservers} onChange={handleChange} className="w-full p-2 border rounded" /></>}
          {step === 3 && <><input type="text" name="nodeFlavor" placeholder="Node Flavor" value={form.nodeFlavor} onChange={handleChange} className="w-full p-2 border rounded" required /></>}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        {step > 0 && <button onClick={prevStep} className="p-2 bg-gray-500 text-white rounded">Previous</button>}
        {step < steps.length - 1 && <button onClick={nextStep} disabled={!isStepValid()} className={`p-2 rounded ${isStepValid() ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>Next</button>}
      </div>
    </div>
  );
}

import './App.css'
import React, { useState, useEffect } from "react";

// Reusable input with tooltip component
const InputWithTooltip = ({ type, name, placeholder, value, onChange, required, tooltip, className = "" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative w-full mb-3">
      <div className="flex items-center">
        <input 
          type={type || "text"} 
          name={name} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange} 
          className={`w-full p-2 border rounded ${className}`}
          required={required} 
        />
        <div 
          className="ml-2 text-gray-500 cursor-help" 
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {showTooltip && (
        <div className="absolute right-0 z-10 p-2 mt-1 text-sm bg-gray-800 text-white rounded shadow-lg w-64">
          {tooltip}
        </div>
      )}
    </div>
  );
};

// SelectWithTooltip component
const SelectWithTooltip = ({ name, value, onChange, options, required, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative w-full mb-3">
      <div className="flex items-center">
        <select 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="w-full p-2 border rounded"
          required={required}
        >
          <option value="" disabled>Select platform</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div 
          className="ml-2 text-gray-500 cursor-help" 
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {showTooltip && (
        <div className="absolute right-0 z-10 p-2 mt-1 text-sm bg-gray-800 text-white rounded shadow-lg w-64">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default function HcpCliAssistant() {
  // Platform config
  const platforms = [
    { value: "openstack", label: "OpenStack" },
    // Future platforms can be added here
    // { value: "aws", label: "AWS" },
    // { value: "azure", label: "Azure" },
  ];

  // Step configurations for each platform
  const platformSteps = {
    openstack: [
      "OpenStack Authentication",
      "OpenStack Networking",
      "OpenStack Node Configuration",
      "Review & Generate Command"
    ],
    // Add more platform steps as they become available
  };

  // Common initial steps
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    // Common fields
    name: "",
    baseDomain: "",
    nodePoolReplicas: "2", // Set a default value
    pullSecret: "",
    sshKey: "",
    platform: "",
    
    // OpenStack specific fields
    osCloudSet: true,
    openstackCredentialsFile: "",
    openstackCaCertFile: "",
    openstackCloud: "",
    externalNetworkId: "",
    ingressFloatingIp: "",
    nodeFlavor: "",
    nodeAZ: "",
    nodeImageName: "",
    dnsNameservers: "",
    additionalPorts: JSON.stringify([]),
  });

  // Add this to your component
  useEffect(() => {
    // If we're on the platform selection step and there's only one platform available, select it automatically
    if (step === 1 && platforms.length === 1 && !form.platform) {
      setForm(prev => ({
        ...prev,
        platform: platforms[0].value
      }));
    }
  }, [step, platforms.length, form.platform]);

  // Get steps based on selected platform
  const getSteps = () => {
    const commonSteps = ["Cluster Details", "Platform Selection"];
    if (!form.platform) return commonSteps;
    
    // Ensure the selected platform exists in platformSteps
    if (platformSteps[form.platform]) {
      return [...commonSteps, ...platformSteps[form.platform]];
    }
    
    // Fallback if platform not found
    return [...commonSteps, "Platform Not Supported"];
  };
  
  const steps = getSteps();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 0: // Cluster Details
        return form.name.trim() !== "" && 
               form.baseDomain.trim() !== "" && 
               form.nodePoolReplicas.trim() !== "" && 
               form.pullSecret.trim() !== "" && 
               form.sshKey.trim() !== "";
      case 1: // Platform Selection
        return form.platform && form.platform.trim() !== "" && platformSteps[form.platform] !== undefined;
      default:
        // Platform specific validations - only if the platform is supported
        if (form.platform === "openstack") {
          const platformStep = step - 2; // Adjust for common steps
          
          switch (platformStep) {
            case 0: // OpenStack Authentication
              return form.osCloudSet || form.openstackCredentialsFile.trim() !== "";
            case 1: // OpenStack Networking
              if (form.additionalPorts) {
                try {
                  const ports = JSON.parse(form.additionalPorts);
                  // Only validate ports that have a networkId entered
                  const portsWithNetworkId = ports.filter(port => port.networkId && port.networkId.trim() !== "");
                  return portsWithNetworkId.length === 0 || 
                         portsWithNetworkId.every(port => port.networkId && port.networkId.trim() !== "");
                } catch (e) {
                  console.error("Error parsing additionalPorts:", e);
                  return false;
                }
              }
              return true;
            case 2: // OpenStack Node Configuration
              return form.nodeFlavor.trim() !== "";
            default:
              return true;
          }
        }
        return false; // If the platform is not handled, validation fails
    }
  };

  const generateCommand = () => {
    if (form.platform === "openstack") {
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
        try {
          const ports = JSON.parse(form.additionalPorts);
          ports.forEach((port) => {
            if (port.networkId && port.networkId.trim() !== "") {
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
            }
          });
        } catch (e) {
          console.error("Error parsing additionalPorts during command generation:", e);
        }
      }

      cmd = cmd.replace(/\s+/g, ' ').trim();
      return cmd;
    }
    
    return "Platform command generation not implemented";
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

  // Render current step content
  const renderStepContent = () => {
    if (step === 0) {
      // Cluster Details (Common for all platforms)
      return (
        <>
          <InputWithTooltip 
            name="name" 
            placeholder="Cluster Name (required). Example: test" 
            value={form.name} 
            onChange={handleChange} 
            required
            tooltip="A unique name for your HyperShift cluster. This will be used to identify your cluster in the HyperShift control plane."
          />
          <InputWithTooltip 
            name="baseDomain" 
            placeholder="Base Domain (required). Example: mydomain.com" 
            value={form.baseDomain} 
            onChange={handleChange} 
            required
            tooltip="The base domain of your cluster. This domain will be used to create DNS records for your cluster."
          />
          <InputWithTooltip 
            type="number" 
            name="nodePoolReplicas" 
            placeholder="Node Pool Replicas (required)" 
            value={form.nodePoolReplicas} 
            onChange={handleChange} 
            required
            tooltip="The number of worker nodes to create in your cluster's default node pool."
          />
          <InputWithTooltip 
            name="pullSecret" 
            placeholder="Pull Secret path (required). Example: /path/to/pull-secret" 
            value={form.pullSecret} 
            onChange={handleChange} 
            required
            tooltip="Path to the pull secret file. This is required to pull container images from the Red Hat registry."
          />
          <InputWithTooltip 
            name="sshKey" 
            placeholder="SSH Key path (required). Example: /path/to/id_rsa.pub" 
            value={form.sshKey} 
            onChange={handleChange} 
            required
            tooltip="Path to your SSH public key file. This key will be added to the authorized_keys on all nodes."
          />
        </>
      );
    } else if (step === 1) {
      // Platform Selection
      return (
        <>
          <p className="mb-4">Select the platform where you want to deploy your HyperShift cluster:</p>
          <SelectWithTooltip
            name="platform"
            value={form.platform}
            onChange={handleChange}
            options={platforms}
            required
            tooltip="Select the cloud platform where you want to deploy your HyperShift cluster."
          />
          
          {form.platform && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">
                Selected platform: <strong>{platforms.find(p => p.value === form.platform)?.label || form.platform}</strong>
              </p>
            </div>
          )}
          
          {platforms.length === 1 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
              <p>
                <strong>Note:</strong> Currently only OpenStack is supported. More platforms will be added in future updates.
              </p>
            </div>
          )}
        </>
      );
    } else if (form.platform === "openstack") {
      // OpenStack specific steps
      const platformStep = step - 2; // Adjust for common steps
      
      switch (platformStep) {
        case 0: // OpenStack Authentication
          return (
            <>
              <label className="block mb-4">
                <input 
                  type="checkbox" 
                  name="osCloudSet" 
                  checked={form.osCloudSet} 
                  onChange={handleChange} 
                  className="mr-2" 
                />
                OS_CLOUD is set in the environment
                <span 
                  className="ml-2 text-gray-500 cursor-help relative inline-block"
                  onMouseEnter={(e) => e.target.querySelector('div').style.display = 'block'}
                  onMouseLeave={(e) => e.target.querySelector('div').style.display = 'none'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute right-0 z-10 p-2 mt-1 text-sm bg-gray-800 text-white rounded shadow-lg w-64" style={{display: 'none'}}>
                    Check this if you have the OS_CLOUD environment variable set. Otherwise, you'll need to provide a credentials file.
                  </div>
                </span>
              </label>
              
              {!form.osCloudSet && (
                <InputWithTooltip 
                  name="openstackCredentialsFile" 
                  placeholder="OpenStack Credentials File (required). Example: /path/to/clouds.yaml" 
                  value={form.openstackCredentialsFile} 
                  onChange={handleChange}
                  required={!form.osCloudSet}
                  tooltip="Path to your OpenStack clouds.yaml file containing your authentication credentials."
                />
              )}
              
              <InputWithTooltip 
                name="openstackCloud" 
                placeholder="OpenStack Cloud (optional). Default: openstack" 
                value={form.openstackCloud} 
                onChange={handleChange}
                tooltip="The named cloud to use from your clouds.yaml file if you have multiple clouds defined."
              />
              
              <InputWithTooltip 
                name="openstackCaCertFile" 
                placeholder="OpenStack CA Certificate File (optional). Example: /path/to/ca.cert" 
                value={form.openstackCaCertFile} 
                onChange={handleChange}
                tooltip="Path to a CA certificate file if your OpenStack environment uses a self-signed certificate."
              />
            </>
          );
        case 1: // OpenStack Networking
          return (
            <>
              <InputWithTooltip 
                name="externalNetworkId" 
                placeholder="External Network ID (optional). Example: 64f629fd-f75b-4e66-96ad-94f6f2125ba4" 
                value={form.externalNetworkId} 
                onChange={handleChange}
                tooltip="The ID of the external network that will be used for floating IPs. If not provided, the installer will attempt to discover it."
              />
              
              <InputWithTooltip 
                name="ingressFloatingIp" 
                placeholder="Ingress Floating IP (optional). Example: 192.168.100.7" 
                value={form.ingressFloatingIp} 
                onChange={handleChange}
                tooltip="A pre-allocated floating IP to use for cluster ingress. If not provided, a new floating IP will be allocated."
              />
              
              <InputWithTooltip 
                name="dnsNameservers" 
                placeholder="DNS Nameservers (optional). Example: 1.1.1.1,8.8.8.8" 
                value={form.dnsNameservers} 
                onChange={handleChange}
                tooltip="Comma-separated list of DNS nameservers to use for the cluster's subnet."
              />
              
              {/* Additional ports section */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">
                  Additional Nodepool Ports (optional)
                  <span 
                    className="ml-2 text-gray-500 cursor-help relative inline-block"
                    onMouseEnter={(e) => e.target.querySelector('div').style.display = 'block'}
                    onMouseLeave={(e) => e.target.querySelector('div').style.display = 'none'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute right-0 z-10 p-2 mt-1 text-sm bg-gray-800 text-white rounded shadow-lg w-64" style={{display: 'none'}}>
                      Configure additional network ports for the nodes in your cluster. Useful for multi-network setups or SR-IOV configurations.
                    </div>
                  </span>
                </h3>
                
                {form.additionalPorts && JSON.parse(form.additionalPorts).map((port, index) => (
                  <div key={index} className="p-3 border rounded mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Port {index + 1}</span>
                      <button 
                        onClick={() => {
                          try {
                            const ports = JSON.parse(form.additionalPorts);
                            ports.splice(index, 1);
                            setForm({
                              ...form,
                              additionalPorts: JSON.stringify(ports)
                            });
                          } catch (e) {
                            console.error("Error removing port:", e);
                          }
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
                            try {
                              const ports = JSON.parse(form.additionalPorts);
                              ports[index].networkId = e.target.value;
                              setForm({
                                ...form,
                                additionalPorts: JSON.stringify(ports)
                              });
                            } catch (e) {
                              console.error("Error updating port networkId:", e);
                            }
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
                            try {
                              const ports = JSON.parse(form.additionalPorts);
                              ports[index].vnicType = e.target.value;
                              setForm({
                                ...form,
                                additionalPorts: JSON.stringify(ports)
                              });
                            } catch (e) {
                              console.error("Error updating port vnicType:", e);
                            }
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
                            try {
                              const ports = JSON.parse(form.additionalPorts);
                              ports[index].addressPairs = e.target.value;
                              setForm({
                                ...form,
                                additionalPorts: JSON.stringify(ports)
                              });
                            } catch (e) {
                              console.error("Error updating port addressPairs:", e);
                            }
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
                              try {
                                const ports = JSON.parse(form.additionalPorts);
                                ports[index].disablePortSecurity = e.target.checked;
                                setForm({
                                  ...form,
                                  additionalPorts: JSON.stringify(ports)
                                });
                              } catch (e) {
                                console.error("Error updating port security:", e);
                              }
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
                    try {
                      const ports = form.additionalPorts ? JSON.parse(form.additionalPorts) : [];
                      ports.push({ networkId: "" });
                      setForm({
                        ...form,
                        additionalPorts: JSON.stringify(ports)
                      });
                    } catch (e) {
                      console.error("Error adding new port:", e);
                      // Initialize with empty array if parsing fails
                      setForm({
                        ...form,
                        additionalPorts: JSON.stringify([{ networkId: "" }])
                      });
                    }
                  }}
                  className="mt-2 px-3 py-2 bg-green-500 text-white rounded"
                >
                  Add Port
                </button>
              </div>
            </>
          );
        case 2: // OpenStack Node Configuration
          return (
            <>
              <InputWithTooltip 
                name="nodeFlavor" 
                placeholder="Flavor name for the Nodepool (Required)" 
                value={form.nodeFlavor} 
                onChange={handleChange} 
                required
                tooltip="The OpenStack flavor (instance type) to use for the worker nodes in your cluster."
              />
              
              <InputWithTooltip 
                name="nodeAZ" 
                placeholder="Nova Availability Zone (optional)" 
                value={form.nodeAZ} 
                onChange={handleChange}
                tooltip="The availability zone where worker nodes will be created. If not specified, the default AZ will be used."
              />
              
              <InputWithTooltip 
                name="nodeImageName" 
                placeholder="Glance Image Name (optional)" 
                value={form.nodeImageName} 
                onChange={handleChange}
                tooltip="The name of the RHCOS image in Glance to use for the worker nodes. If not specified, the installer will use the latest available RHCOS image."
              />
            </>
          );
        case 3: // Review & Generate Command (final step for OpenStack)
          return (
            <div className="mt-6 p-4 border rounded">
              <h2 className="text-lg font-bold">Generated Command:</h2>
              <pre className="p-2 bg-black text-white border rounded whitespace-pre-wrap">{generateCommand()}</pre>
              <button
                className="mt-2 p-2 rounded bg-blue-500 text-white"
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy Command"}
              </button>
            </div>
          );
        default:
          return (
            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
              <p>Unknown step for the OpenStack platform. Please go back and try again.</p>
            </div>
          );
      }
    } else if (form.platform) {
      // For any platform that is selected but not implemented
      return (
        <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p>Support for the {form.platform} platform is coming soon!</p>
        </div>
      );
    }
    
    return null;
  };

  // Determine if we're on the final review step
  const isFinalStep = step === steps.length - 1;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hypershift CLI Assistant</h1>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex mb-2 justify-between">
          {steps.map((stepName, idx) => (
            <div 
              key={idx} 
              className={`text-xs ${idx <= step ? 'text-blue-600' : 'text-gray-400'}`}
              style={{ width: `${100 / steps.length}%`, textAlign: idx === 0 ? 'left' : idx === steps.length - 1 ? 'right' : 'center' }}
            >
              {stepName}
            </div>
          ))}
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div style={{ width: `${((step + 1) / steps.length) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold mb-4">Step {step + 1}: {steps[step]}</h2>

      <div className="space-y-4">
        {renderStepContent()}
      </div>

      <div className="mt-6 flex justify-between">
        {step > 0 && <button onClick={prevStep} className="p-2 bg-gray-500 text-white rounded">Previous</button>}
        {!isFinalStep && (
          <button 
            onClick={nextStep} 
            disabled={!isStepValid()} 
            className={`p-2 rounded ${isStepValid() ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

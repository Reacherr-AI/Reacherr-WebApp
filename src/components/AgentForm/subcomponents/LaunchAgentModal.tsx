import React, { useEffect, useState } from "react";
import { Rocket, X, Loader2 } from "lucide-react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { PhoneNumber } from "@/types";

interface LaunchModalProps {
  data: any;
  agentId: string;
  phoneList: PhoneNumber[];
  onClose: () => void;
  onPublish: (payload: any) => void;
}

const LaunchAgentModal: React.FC<LaunchModalProps> = ({
  data,
  agentId,
  phoneList,
  onClose,
  onPublish,
}) => {
  const [versionName, setVersionName] = useState(data.versionName || "V0");
  const [description, setDescription] = useState("");
  const [inboundEnabled, setInboundEnabled] = useState(false);
  const [outboundEnabled, setOutboundEnabled] = useState(false);
  const [selectedInbound, setSelectedInbound] = useState<string>("");
  const [selectedOutbound, setSelectedOutbound] = useState<string>("");
  
  // Hydrate form when phoneList is available
  useEffect(() => {
    if (phoneList.length > 0 && agentId) {
      // Hydrate Inbound
      const inboundMatch = phoneList.find(p => p.inboundAgentId === agentId);
      if (inboundMatch) {
        setInboundEnabled(true);
        setSelectedInbound(inboundMatch.phoneNumber);
      }

      // Hydrate Outbound
      const outboundMatch = phoneList.find(p => p.outboundAgentId === agentId);
      if (outboundMatch) {
        setOutboundEnabled(true);
        setSelectedOutbound(outboundMatch.phoneNumber);
      }
    }
  }, [phoneList, agentId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[500px] bg-white rounded-[28px] border border-zinc-100 shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Rocket size={16} className="text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">Launch Agent</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Version Name</Label>
              <Input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* PHONE SELECTION */}
          <div className="space-y-3">
            <Label>Select Phone Number</Label>
            
            {/* INBOUND */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={inboundEnabled}
                  onCheckedChange={(v) => setInboundEnabled(!!v)}
                  id="inbound-check"
                />
                <Label htmlFor="inbound-check" className="cursor-pointer">Inbound phone number</Label>
              </div>

              {inboundEnabled && (
                <Select value={selectedInbound} onValueChange={setSelectedInbound}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a phone number" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={6}
                    className="z-[999] max-h-[200px]"
                  >
                    {phoneList.map((opt) => (
                      <SelectItem key={opt.phoneNumber} value={opt.phoneNumber}>
                        {opt.nickname || opt.phoneNumber} <span className="text-zinc-400 text-xs ml-2">({opt.phoneNumber})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* OUTBOUND */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={outboundEnabled}
                  onCheckedChange={(v) => setOutboundEnabled(!!v)}
                  id="outbound-check"
                />
                <Label htmlFor="outbound-check" className="cursor-pointer">Outbound phone number</Label>
              </div>

              {outboundEnabled && (
                <Select value={selectedOutbound} onValueChange={setSelectedOutbound}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a phone number" />
                  </SelectTrigger>

                  <SelectContent
                    position="popper"
                    sideOffset={6}
                    className="z-[999] max-h-[200px]"
                  >
                      {phoneList.map((opt) => (
                      <SelectItem key={opt.phoneNumber} value={opt.phoneNumber}>
                        {opt.nickname || opt.phoneNumber} <span className="text-zinc-400 text-xs ml-2">({opt.phoneNumber})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-zinc-50 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onPublish({
                versionName,
                description,
                inboundEnabled,
                selectedInbound,
                outboundEnabled,
                selectedOutbound,
              })
            }
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LaunchAgentModal;

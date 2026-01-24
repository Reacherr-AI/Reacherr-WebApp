import React, { useState } from 'react';
import { 
  Plus, 
  Info, 
  PhoneForwarded, 
  MessageSquare, 
  Calendar, 
  Search,
  Code, 
  Trash2, 
  Settings2,
  Zap
} from 'lucide-react';
import { Switch } from '@/ui/switch';
import { Button } from '@/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/ui/Tooltip";
import { FunctionSettingsFormProps, CustomFunction } from './AgentForm.types';
import { CustomFunctionModal } from './subcomponents/CustomFunctionModal';
import { TransferModal } from './subcomponents/TransferModal';
import { SMSModal } from './subcomponents/SMSModal';

/**
 * Reusable Row for Agent Capabilities - Updated with Elevated Card Styling
 */
const CapabilityRow = ({ 
  label, 
  icon: Icon, 
  enabled, 
  onToggle, 
  onConfig, 
  hasConfig = true,
  description 
}: any) => (
  <div className="flex items-center justify-between p-6 bg-white border border-zinc-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
    <div className="flex items-center gap-5">
      <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-blue-50 transition-colors border border-zinc-100/50">
        <Icon size={20} className="text-zinc-500 group-hover:text-blue-600" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[15px] text-zinc-800 tracking-tight">{label}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info size={13} className="text-zinc-400 hover:text-zinc-600" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[220px] text-[11px] p-3">
                {description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-[11px] text-zinc-400 mt-0.5 font-medium leading-relaxed max-w-[400px]">{description}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      {enabled && hasConfig && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 px-3 rounded-lg border-zinc-200 hover:bg-zinc-50 text-zinc-600 flex items-center gap-2 text-xs font-bold"
          onClick={onConfig}
        >
          <Settings2 size={14} />
          Configure
        </Button>
      )}
      <div className="h-6 w-px bg-zinc-100 mx-1" />
      <Switch 
        checked={enabled} 
        onCheckedChange={onToggle} 
        className="data-[state=checked]:bg-blue-600"
      />
    </div>
  </div>
);

const FunctionSettingsForm: React.FC<FunctionSettingsFormProps> = ({ data, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<CustomFunction | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2.5 mb-6">
      <div className="p-1.5 bg-blue-50/50 rounded-md border border-blue-100/30">
        <Icon size={14} className="text-blue-600" />
      </div>
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">
        {title}
      </h3>
    </div>
  );

  const handleOpenAddModal = () => {
    setEditingFunction(null);
    setIsModalOpen(true);
  };

  const handleRemoveFunction = (id: string) => {
    const updated = data.customFunctions.filter(f => f.id !== id);
    onChange('customFunctions', updated);
  };

  const handleSaveCustomFunction = (funcData: any) => {
    const newFunction: CustomFunction = {
      ...funcData,
      id: editingFunction?.id || Date.now().toString(),
    };

    const updatedFunctions = editingFunction 
      ? data.customFunctions.map(f => f.id === editingFunction.id ? newFunction : f)
      : [...data.customFunctions, newFunction];

    onChange('customFunctions', updatedFunctions);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header Section */}
      <div className="space-y-1.5 px-1">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Agent Functions</h2>
        <p className="text-sm text-zinc-500">Equip your agent with tools to perform complex tasks and integrations during calls.</p>
      </div>

      {/* 2. Native Capabilities Section */}
      <div className="space-y-5">
        <SectionHeader icon={Zap} title="Native Integrations" />
        
        <div className="grid grid-cols-1 gap-4">
          <CapabilityRow 
            label="Transfer to Human" 
            icon={PhoneForwarded}
            enabled={data.transferEnabled}
            onToggle={(val: boolean) => onChange('transferEnabled', val)}
            onConfig={() => setActiveModal('transfer')}
            description="Enables the agent to transfer the call to a specific phone number or human representative."
          />

          <CapabilityRow 
            label="Custom SMS Follow-up" 
            icon={MessageSquare}
            enabled={data.smsEnabled}
            onToggle={(val: boolean) => onChange('smsEnabled', val)}
            onConfig={() => setActiveModal('sms')}
            description="Trigger a text message automatically during or after the conversation."
          />

          {/* Cal.com Booking Group */}
          <div className="space-y-4">
            <CapabilityRow 
              label="Book a Meeting (Cal.com)" 
              icon={Calendar}
              enabled={data.bookingEnabled}
              onToggle={(val: boolean) => onChange('bookingEnabled', val)}
              description="Integrates your agent with Cal.com to schedule appointments in real-time."
            />
            {data.bookingEnabled && !data.bookingDetails.calComApiKey && (
              <div className="mx-4 p-5 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 text-center animate-in slide-in-from-top-2">
                <p className="text-sm text-zinc-600 font-bold italic tracking-tight">Account Integration Required</p>
                <p className="text-[11px] text-zinc-400 mt-1">Please provide an API Key to enable real-time scheduling workflows.</p>
              </div>
            )}
          </div>

          <CapabilityRow 
            label="Check Calendar Availability" 
            icon={Search}
            enabled={data.checkAvailabilityEnabled}
            onToggle={(val: boolean) => onChange('checkAvailabilityEnabled', val)}
            description="Allows the agent to query Cal.com for available slots before booking."
          />
        </div>
      </div>

      {/* 3. Custom Function Registry */}
      <div className="space-y-5 pt-4">
        <div className="flex justify-between items-center px-1">
          <SectionHeader icon={Code} title="Custom API Functions" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenAddModal} 
            className="h-9 text-blue-600 font-bold hover:bg-blue-50 border-blue-100 hover:border-blue-200 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Function
          </Button>
        </div>

        {data.customFunctions.length === 0 ? (
          <div className="py-20 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center text-center bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="w-14 h-14 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center mb-5 shadow-sm">
              <Code size={24} className="text-zinc-300" />
            </div>
            <p className="text-[15px] font-bold text-zinc-700 tracking-tight">No custom tools defined yet</p>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-[320px] leading-relaxed">
              Register external APIs to allow your agent to fetch data or trigger workflows in your CRM during live calls.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.customFunctions.map((func) => (
              <div 
                key={func.id} 
                className="flex items-center justify-between p-6 bg-white border border-zinc-100 rounded-2xl group hover:border-blue-200 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-zinc-900 rounded-xl text-white shadow-lg shadow-zinc-200 border border-zinc-800">
                    <Code size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <p className="font-bold text-[15px] text-zinc-800 tracking-tight">{func.name}</p>
                      <span className="text-[9px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded-full border border-blue-100 font-bold uppercase tracking-wider">
                        {func.method}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono mt-1 opacity-80">{func.endpointUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                    onClick={() => {
                      setEditingFunction(func);
                      setIsModalOpen(true);
                    }}
                  >
                    <Settings2 size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => handleRemoveFunction(func.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <div className="h-6 w-[1px] bg-zinc-100 mx-2" />
                  <Switch checked={true} className="data-[state=checked]:bg-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TransferModal 
        isOpen={data.transferEnabled && activeModal === 'transfer'}
        onClose={() => setActiveModal(null)}
        data={data.transferDetails}
        onChange={(field:any,value:any)=> onChange('transferDetails', {...data.transferDetails,[field]:value})}
      />
      <SMSModal 
        isOpen={activeModal === 'sms'} 
        onClose={() => setActiveModal(null)}
        data={data.smsDetails}
        onChange={(field: string, val: any) => onChange('smsDetails', { ...data.smsDetails, [field]: val })}
      />
      <CustomFunctionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomFunction}
        initialData={editingFunction}
      />
    </div>
  );
};

export default FunctionSettingsForm;
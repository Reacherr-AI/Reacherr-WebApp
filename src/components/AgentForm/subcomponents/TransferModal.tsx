import React, { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, PhoneForwarded, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { allCountries } from 'country-telephone-data';
import { isValidNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

const getFlagEmoji = (countryCode: string) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

export const TransferModal = ({ isOpen, onClose, data, onChange }: any) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Memoize the list for performance
  const ALL_COUNTRIES = useMemo(() => {
    return allCountries
      .map(country => ({
        name: country.name,
        code: `+${country.dialCode}`,
        flag: getFlagEmoji(country.iso2),
        iso: country.iso2,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedCountry = useMemo(() => {
    return ALL_COUNTRIES.find((c) => c.iso === data.isoCode) || 
           ALL_COUNTRIES.find(c => c.iso === 'us');
  }, [data.isoCode, ALL_COUNTRIES]);

  // Validation Logic
  const isPhoneValid = useMemo(() => {
    if (!data.phoneNumber) return true; // Don't show error if empty
    try {
      return isValidNumber(data.phoneNumber, selectedCountry?.iso.toUpperCase() as any);
    } catch (e) {
      return false;
    }
  }, [data.phoneNumber, selectedCountry]);

  const handleSelect = (country: any) => {
    onChange('countryCode', country.code);
    onChange('isoCode', country.iso);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-in fade-in zoom-in-95 duration-300">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-zinc-900">
            <PhoneForwarded size={18} className="text-blue-600" /> Transfer to Human
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Action Name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Action Name</Label>
            <Input 
              value={data.name} 
              placeholder='e.g. transfer_call'
              onChange={(e) => onChange('name', e.target.value)}
              className="bg-zinc-50 border-zinc-200 text-zinc-600 h-10 font-mono text-xs" 
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Description</Label>
            <Textarea 
              placeholder="e.g. Transfer to agent when user requests specialized help" 
              value={data.description}
              onChange={(e) => onChange('description', e.target.value)}
              className="h-20 resize-none border-zinc-200 focus:ring-1 text-sm leading-relaxed"
            />
          </div>

          {/* Phone Number Input with Validation UI */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Phone Number</Label>
              {!isPhoneValid && data.phoneNumber && (
                <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                  <AlertCircle size={10} /> Invalid for {selectedCountry?.name}
                </span>
              )}
            </div>
            
            <div className={cn(
              "flex shadow-sm rounded-lg overflow-hidden border transition-all",
              !isPhoneValid && data.phoneNumber ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 focus-within:ring-1 focus-within:ring-blue-500"
            )}>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="w-[110px] justify-between rounded-none border-r border-zinc-100 h-10 px-3 hover:bg-zinc-50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg leading-none">{selectedCountry?.flag}</span>
                      <span className="text-sm font-medium">{selectedCountry?.code}</span>
                    </span>
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <Command>
                    <CommandInput 
                        placeholder="Search country..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {ALL_COUNTRIES.map((country) => (
                          <CommandItem
                            key={country.iso}
                            value={`${country.name} ${country.code}`}
                            onSelect={() => handleSelect(country)}
                            className="flex items-center justify-between py-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{country.flag}</span>
                              <span className="text-sm truncate max-w-[140px]">{country.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-400 font-mono">{country.code}</span>
                                <Check
                                    className={cn(
                                        "h-4 w-4 text-blue-600",
                                        selectedCountry?.iso === country.iso ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Input 
                type="tel"
                placeholder="Enter phone number" 
                value={data.phoneNumber}
                onChange={(e) => onChange('phoneNumber', e.target.value)}
                className="flex-1 border-none focus-visible:ring-0 h-10 text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 bg-zinc-50/50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <Button variant="ghost" onClick={onClose} className="text-zinc-500">Cancel</Button>
          <Button 
            disabled={!isPhoneValid && !!data.phoneNumber}
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 font-semibold" 
            onClick={onClose}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
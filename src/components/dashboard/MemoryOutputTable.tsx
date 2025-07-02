import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { MemoryAddress } from '@/types/memoryAddress';
import { profileStorage } from '@/lib/profileStorage';
import { MemoryProfile } from '@/types/memoryProfiles';

interface MemoryOutputTableProps {
  addresses: MemoryAddress[];
  setAddresses: React.Dispatch<React.SetStateAction<MemoryAddress[]>>;
  processName: string;
  pollInterval: number;
}

const DATA_TYPES = [
  "Int8",
  "UInt8",
  "Int16",
  "UInt16",
  "Int32",
  "UInt32",
  "Int64",
  "UInt64",
  "Float",
  "Double",
  "String",
  "Byte"
];

export function MemoryOutputTable({ addresses, setAddresses, processName, pollInterval }: MemoryOutputTableProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const debouncedAddresses = useDebounce(addresses, 500);

  useEffect(() => {
    if (JSON.stringify(addresses) !== JSON.stringify(debouncedAddresses)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [addresses, debouncedAddresses]);

  const handleAddressChange = (id: string, field: string, value: any) => {
    setAddresses(prevAddresses =>
      prevAddresses.map(addr =>
        addr.id === id ? { ...addr, [field]: value } : addr
      )
    );
  };

  const handleAddAddress = () => {
    const newAddress: MemoryAddress = {
      id: `address_${Date.now()}`,
      label: 'New Address',
      address: '0x',
      type: 'Int32',
      value: null,
      rawValue: null,
      finalValue: null,
      lastRead: null,
      success: false,
      error: null,
      notes: '',
      invert: false,
      format: '{value}',
      script: '',
      useModuleOffset: false,
      moduleName: '',
      offset: '',
      offsetFormat: 'hex',
      offsets: [],
      bitmask: '',
      bitwiseOp: '',
      bitfield: false,
      isPointerChain: false,
      disableCaching: false,
      fastModeEnabled: false,
      source: 'user'
    };
    setAddresses(prevAddresses => [...prevAddresses, newAddress]);
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== id));
  };

  const createMemoryProfile = () => {
    const profile: MemoryProfile = {
      id: `profile_${Date.now()}`,
      fileName: `profile_${Date.now()}.json`,
      process: processName || 'unknown',
      pollInterval: pollInterval || 16,
      outputs: addresses.map(addr => profileStorage.convertAddressToProfileOutput(addr)),
      lastModified: Date.now(),
      outputCount: addresses.length,
      memoryProfileType: 'user'
    };
    return profile;
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const profile = createMemoryProfile();
      const result = await window.electron.saveMemoryProfile(profile.fileName, profile);

      if (result && result.success) {
        toast.success('Profile saved successfully!');
      } else {
        toast.error(result?.error || 'Failed to save profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableCaption>List of memory addresses to monitor.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Label</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {addresses.map((address) => (
            <TableRow key={address.id}>
              <TableCell>
                <Input
                  type="text"
                  value={address.label}
                  onChange={(e) => handleAddressChange(address.id, 'label', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={address.address}
                  onChange={(e) => handleAddressChange(address.id, 'address', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select value={address.type} onValueChange={(value) => handleAddressChange(address.id, 'type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={address.notes}
                  onChange={(e) => handleAddressChange(address.id, 'notes', e.target.value)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => handleRemoveAddress(address.id)}>
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Button onClick={handleAddAddress}>Add Address</Button>
        <div>
          <Button onClick={handleSaveProfile} disabled={!isDirty || isSaving}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileStorage } from '@/lib/profileStorage';
import { MemoryProfile } from '@/types/memoryProfiles';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';

interface CommunityProfilesListProps {
  onProfileImport?: (profile: MemoryProfile) => void;
}

export function CommunityProfilesList({ onProfileImport }: CommunityProfilesListProps) {
  const [data, setData] = useState<MemoryProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profileNames = await profileStorage.listMemoryProfiles();
      const profiles: MemoryProfile[] = [];
      for (const name of profileNames) {
        const profile = await profileStorage.getMemoryProfile(name);
        if (profile && profile.memoryProfileType === 'community') {
          profiles.push(profile);
        }
      }
      setData(profiles);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch community profiles');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rowVirtualizer = useVirtualizer({
    count: data?.length || 0,
    estimateSize: useCallback(() => 50, []),
    overscan: 5,
  });

  const virtualizedRows = rowVirtualizer.getVirtualItems();

  const VirtualizedCommunityProfileList = ({
    profiles,
    onProfileImport,
  }: {
    profiles: MemoryProfile[];
    onProfileImport?: (profile: MemoryProfile) => void;
  }) => {
    const rowVirtualizer = useVirtualizer({
      count: profiles.length,
      estimateSize: useCallback(() => 50, []),
      overscan: 5,
    });

    const virtualizedRows = rowVirtualizer.getVirtualItems();

    return (
      <div
        className="h-full w-full overflow-auto"
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizedRows.map((virtualRow) => {
            const profile = profiles[virtualRow.index];
            if (!profile) return null;

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: '10px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{profile.fileName}</span>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                  onClick={() => onProfileImport?.(profile)}
                >
                  Import
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Available Community Profiles</h3>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading profiles...</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-full text-red-500">
            Error: {error}
          </div>
        )}
        
        {!loading && !error && (!data || data.length === 0) && (
          <div className="flex items-center justify-center h-full">
            No community profiles found.
          </div>
        )}
        
        {data && data.length > 0 && (
          <div className="h-full">
            <VirtualizedCommunityProfileList 
              profiles={data}
              onProfileImport={onProfileImport}
            />
          </div>
        )}
      </div>
    </div>
  );
}

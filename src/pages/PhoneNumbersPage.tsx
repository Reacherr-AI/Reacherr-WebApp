import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Phone,
  Search,
  X,
  Loader2,
  PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createPhoneNumber,
  listAvailableNumbers,
  listPhoneNumber
} from '@/api/client';
import {
  CountryCodeType,
  PhoneNumberType,
  type AvailableNumberRequest,
  type PhoneNumber as PhoneNumberDto
} from '@/types';

const providers = ['Twilio'] as const;

type Provider = (typeof providers)[number];

type ModalType = 'buy' | 'sip' | null;

type OutboundTransport = 'TCP' | 'UDP' | 'TLS';

const providerTypeMap: Record<Provider, PhoneNumberType> = {
  Twilio: PhoneNumberType.TWILIO
};

const providerLabelMap: Record<PhoneNumberType, string> = {
  [PhoneNumberType.TWILIO]: 'Twilio',
  [PhoneNumberType.TELNYX]: 'Telnyx',
  [PhoneNumberType.CUSTOM]: 'Custom',
  [PhoneNumberType.PLIVO]: 'Plivo'
};

const PhoneNumbersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [provider, setProvider] = useState<Provider>('Twilio');
  const [numberType, setNumberType] = useState<'standard' | 'tollfree'>('standard');
  const [outboundTransport, setOutboundTransport] = useState<OutboundTransport>('TCP');
  const [availableNumbers, setAvailableNumbers] = useState<Array<{ id: string; number: string }>>([]);
  const [ownedNumbers, setOwnedNumbers] = useState<
    Array<{ id: string; number: string; provider: PhoneNumberType }>
  >([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingOwned, setIsLoadingOwned] = useState(false);
  const [availableError, setAvailableError] = useState<string | null>(null);
  const [ownedError, setOwnedError] = useState<string | null>(null);
  const [buyingNumberId, setBuyingNumberId] = useState<string | null>(null);
  const [availablePage, setAvailablePage] = useState(0);
  const [availableLast, setAvailableLast] = useState(true);
  const availableListRef = useRef<HTMLDivElement | null>(null);

  const filteredNumbers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ownedNumbers;
    return ownedNumbers.filter((item) => item.number.toLowerCase().includes(query));
  }, [ownedNumbers, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const loadOwnedNumbers = async () => {
      setIsLoadingOwned(true);
      setOwnedError(null);
      try {
        const response = await listPhoneNumber();
        const next = (response.data || []).map((item: PhoneNumberDto) => ({
          id: item.phoneNumber,
          number: item.phoneNumber,
          provider: item.phoneNumberType
        }));
        if (isMounted) setOwnedNumbers(next);
      } catch (error) {
        if (isMounted) setOwnedError('Unable to load your numbers.');
      } finally {
        if (isMounted) setIsLoadingOwned(false);
      }
    };

    loadOwnedNumbers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeModal !== 'buy') return;
    let isMounted = true;

    const loadAvailableNumbers = async (page: number, append: boolean) => {
      if (!append) {
        setAvailableNumbers([]);
        setAvailablePage(0);
        setAvailableLast(true);
      }
      setIsLoadingAvailable(true);
      setAvailableError(null);
      try {
        const payload: AvailableNumberRequest = {
          countryCode: CountryCodeType.US,
          provider: providerTypeMap[provider],
          isTollFree: numberType === 'tollfree'
        };
        const response = await listAvailableNumbers(payload, page, 5);
        const numbers = response.data?.numbers ?? [];
        const next = numbers.map((number) => ({
          id: number,
          number
        }));
        if (isMounted) {
          setAvailableNumbers((prev) => (append ? [...prev, ...next] : next));
          setAvailableLast(Boolean(response.data?.last));
          setAvailablePage(page);
        }
      } catch (error) {
        if (isMounted) setAvailableError('Unable to load available numbers.');
      } finally {
        if (isMounted) setIsLoadingAvailable(false);
      }
    };

    loadAvailableNumbers(0, false);
    return () => {
      isMounted = false;
    };
  }, [activeModal, provider, numberType]);

  const handleLoadMoreAvailable = async () => {
    if (isLoadingAvailable || isLoadingMore || availableLast) return;
    setIsLoadingMore(true);
    try {
      const payload: AvailableNumberRequest = {
        countryCode: CountryCodeType.US,
        provider: providerTypeMap[provider],
        isTollFree: numberType === 'tollfree'
      };
      const nextPage = availablePage + 1;
      const response = await listAvailableNumbers(payload, nextPage, 5);
      const numbers = response.data?.numbers ?? [];
      const next = numbers.map((number) => ({
        id: number,
        number
      }));
      setAvailableNumbers((prev) => [...prev, ...next]);
      setAvailableLast(Boolean(response.data?.last));
      setAvailablePage(nextPage);
    } catch (error) {
      setAvailableError('Unable to load available numbers.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleAvailableScroll = () => {
    const el = availableListRef.current;
    if (!el || isLoadingAvailable || isLoadingMore || availableLast) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) handleLoadMoreAvailable();
  };

  useEffect(() => {
    const el = availableListRef.current;
    if (!el || isLoadingAvailable || isLoadingMore || availableLast) return;
    const needsMore = el.scrollHeight <= el.clientHeight + 8;
    if (needsMore) handleLoadMoreAvailable();
  }, [availableNumbers, isLoadingAvailable, isLoadingMore, availableLast]);

  const handleBuyNumber = async (numberId: string) => {
    const selected = availableNumbers.find((item) => item.id === numberId);
    if (!selected || buyingNumberId) return;
    setBuyingNumberId(numberId);
    try {
      const response = await createPhoneNumber({
        phoneNumber: selected.number,
        phoneNumberType: providerTypeMap[provider],
        countryCode: CountryCodeType.US,
        isTollFree: numberType === 'tollfree'
      });
      const created = response.data;
      if (created?.phoneNumber) {
        setAvailableNumbers((prev) => prev.filter((item) => item.id !== numberId));
        setOwnedNumbers((prev) => [
          {
            id: created.phoneNumber,
            number: created.phoneNumber,
            provider: created.phoneNumberType
          },
          ...prev
        ]);
        closeModal();
      }
    } catch (error) {
      setAvailableError('Unable to purchase this number.');
    } finally {
      setBuyingNumberId(null);
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex h-[calc(100vh-120px)] min-h-[640px] flex-col gap-4 lg:flex-row">
        {/* Left Panel */}
        <section className="w-full lg:max-w-[340px]">
          <div className="h-full rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <Phone size={16} className="text-zinc-400" />
                Phone Numbers
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                >
                  <Plus size={16} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-11 z-20 w-56 rounded-lg border border-zinc-200 bg-white p-1 text-sm shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal('buy');
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                      <PhoneCall size={14} className="text-zinc-400" />
                      Buy New Number
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal('sip');
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                      <Phone size={14} className="text-zinc-400" />
                      Connect to your number via SIP trunking
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input
                  type="text"
                  placeholder="Search phone numbers"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
              </div>
            </div>

            <div className="h-[calc(100%-112px)] px-4 py-3 pb-6 text-xs text-zinc-500">
              {isLoadingOwned ? (
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <Loader2 size={16} className="animate-spin" />
                  Loading your numbers...
                </div>
              ) : ownedError ? (
                <span>{ownedError}</span>
              ) : filteredNumbers.length === 0 ? (
                <span>No phone numbers yet</span>
              ) : (
                <div className="w-full space-y-2 overflow-y-auto pb-2 text-left">
                  {filteredNumbers.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm"
                    >
                      <span>{item.number}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className="flex-1">
          <div className="relative h-full rounded-2xl border border-zinc-200 bg-white">
            {ownedNumbers.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white">
                    <Phone size={18} className="text-zinc-400" />
                  </div>
                  <p className="text-sm font-medium">
                    {isLoadingOwned ? 'Loading your numbers...' : "You don't have any phone numbers"}
                  </p>
                  {ownedError && <p className="text-xs text-zinc-400">{ownedError}</p>}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-6">
                <div className="grid gap-3 md:grid-cols-2">
                  {ownedNumbers.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                    >
                      <div className="text-xs font-semibold text-zinc-500">Owned Number</div>
                      <div className="mt-2 text-sm font-semibold text-zinc-900">{item.number}</div>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-zinc-500">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                          Connected
                        </span>
                        <span>{providerLabelMap[item.provider]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {activeModal === 'buy' && (
        <Modal title="Buy Phone Number" onClose={closeModal}>
          <div className="flex items-center rounded-md border border-zinc-200 bg-zinc-50 p-1 text-[12px] font-semibold">
            {providers.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setProvider(value)}
                className={cn(
                  'flex-1 rounded-md px-4 py-2 transition',
                  provider === value
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                )}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-6 text-xs font-semibold text-zinc-700">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="numberType"
                checked={numberType === 'standard'}
                onChange={() => setNumberType('standard')}
              />
              <span>Standard ($2/month)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="numberType"
                checked={numberType === 'tollfree'}
                onChange={() => setNumberType('tollfree')}
              />
              <span>Toll-free ($5/month)</span>
            </label>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              <span>Available Numbers</span>
            </div>
            <div
              ref={availableListRef}
              onScroll={handleAvailableScroll}
              className="mt-3 max-h-[320px] space-y-2 overflow-y-auto rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-3"
            >
              {isLoadingAvailable ? (
                <AvailableNumberSkeleton count={5} />
              ) : availableError ? (
                <div className="text-xs font-medium text-zinc-400">{availableError}</div>
              ) : availableNumbers.length === 0 ? (
                <div className="text-xs font-medium text-zinc-400">No numbers found.</div>
              ) : (
                <>
                  {availableNumbers.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    >
                      <div>
                        <div className="text-xs font-semibold text-zinc-900">{item.number}</div>
                        <div className="text-[11px] font-medium text-zinc-500">
                          {numberType === 'tollfree' ? '$5/month' : '$2/month'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleBuyNumber(item.id)}
                        disabled={buyingNumberId === item.id}
                        className={cn(
                          'rounded-md border border-zinc-200 bg-white px-3 py-2 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-50',
                          buyingNumberId === item.id && 'cursor-not-allowed opacity-60'
                        )}
                      >
                        {buyingNumberId === item.id ? 'Creating...' : 'Buy number'}
                      </button>
                    </div>
                  ))}
                  {isLoadingMore && <AvailableNumberSkeleton count={2} />}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
              <span>Outbound Transport:</span>
              <select
                value={outboundTransport}
                onChange={(event) => setOutboundTransport(event.target.value as OutboundTransport)}
                className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-700"
              >
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="TLS">TLS</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="h-9 rounded-md border border-zinc-200 px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="h-9 rounded-md bg-zinc-900 px-5 text-xs font-semibold text-white shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'sip' && (
        <Modal title="Connect to your number via SIP trunking" onClose={closeModal}>
          <div className="space-y-3">
            <Field label="Phone Number">
              <input
                type="text"
                placeholder="Enter phone number"
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
            </Field>

            <Field label="Termination URI">
              <input
                type="text"
                placeholder="Enter termination URI (NOT Retell SIP server uri)"
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
            </Field>

            <Field label="SIP Trunk User Name (Optional)">
              <input
                type="text"
                placeholder="Enter SIP Trunk User Name"
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
            </Field>

            <Field label="SIP Trunk Password (Optional)">
              <input
                type="password"
                placeholder="Enter SIP Trunk Password"
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
            </Field>

            <Field label="Nickname (Optional)">
              <input
                type="text"
                placeholder="Enter Nickname"
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
              <span>Outbound Transport:</span>
              <select
                value={outboundTransport}
                onChange={(event) => setOutboundTransport(event.target.value as OutboundTransport)}
                className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-700"
              >
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="TLS">TLS</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="h-9 rounded-md border border-zinc-200 px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-9 rounded-md bg-zinc-900 px-5 text-xs font-semibold text-white shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
          >
            <X size={14} />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field: React.FC<FieldProps> = ({ label, children }) => {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-zinc-600">{label}</label>
      {children}
    </div>
  );
};

type AvailableNumberSkeletonProps = {
  count: number;
};

const AvailableNumberSkeleton: React.FC<AvailableNumberSkeletonProps> = ({ count }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`available-skeleton-${index}`}
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2"
        >
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-zinc-200" />
            <div className="h-3 w-16 rounded-full bg-zinc-100" />
          </div>
          <div className="h-7 w-24 rounded-md bg-zinc-100" />
        </div>
      ))}
    </div>
  );
};

export default PhoneNumbersPage;

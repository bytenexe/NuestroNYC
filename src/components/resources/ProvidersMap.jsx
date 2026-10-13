import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Globe, MapPin, MoveRight } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import MapFocus from '@/components/map/MapFocus';
import ProvidersMapList from '@/components/resources/ProvidersMapList';

const TEAL = '#218c82';
const ORANGE = '#e07a09';

function costKey(cost) {
  if (cost === 'free') return 'common.costFree';
  if (cost === 'sliding_scale') return 'common.costSliding';
  if (cost === 'affordable') return 'common.costAffordable';
  return 'common.costPaid';
}

function hasLocation(provider) {
  return typeof provider.lat === 'number' && typeof provider.lng === 'number';
}

export default function ProvidersMap({ providers, selectedId, onSelect }) {
  const { t } = usePrefs();
  const all = providers || [];
  const located = all.filter(hasLocation);
  const selected = all.find((provider) => provider.id === selectedId);
  const selectedLocated = selected && hasLocation(selected);

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="r-card relative isolate overflow-hidden p-0">
          {located.length ? (
            <div className="h-[380px] w-full sm:h-[460px] lg:h-[560px]">
              <MapContainer center={[40.7128, -74.006]} zoom={11} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                {selectedLocated ? <MapFocus lat={selected.lat} lng={selected.lng} /> : null}
                {located.map((provider) => {
                  const active = provider.id === selectedId;
                  const color = active ? ORANGE : TEAL;
                  return (
                    <CircleMarker
                      key={provider.id}
                      center={[provider.lat, provider.lng]}
                      radius={active ? 13 : 9}
                      eventHandlers={{ click: () => onSelect(provider.id) }}
                      pathOptions={{ color, fillColor: color, fillOpacity: active ? 0.95 : 0.85, weight: active ? 3 : 2 }}
                    >
                      <Popup>
                        <div className="space-y-1 text-[13px]">
                          <p className="font-bold text-[hsl(var(--brand-navy))]">{provider.name}</p>
                          {provider.address ? <p className="text-muted-foreground">{provider.address}</p> : null}
                          <p className="font-semibold">{t(costKey(provider.cost))}</p>
                          {provider.phone ? (
                            <a
                              href={`tel:${provider.phone.replace(/[^\d+]/g, '')}`}
                              className="flex items-center gap-1 font-semibold text-[hsl(var(--brand-teal))]"
                            >
                              <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {provider.phone}
                            </a>
                          ) : null}
                          {provider.website ? (
                            <a
                              href={provider.website}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="flex items-center gap-1 font-semibold text-[hsl(var(--brand-teal))]"
                            >
                              <Globe className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.website')}
                            </a>
                          ) : null}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">{t('legal.mapEmpty')}</p>
          )}
          <p className="border-t border-border p-3.5 text-xs text-muted-foreground">{t('legal.mapHint')}</p>
        </div>

        <div className="space-y-4">
          <div className="r-card" aria-live="polite">
            {selected ? (
              <div className="space-y-2">
                <h2 className="font-heading text-base font-extrabold text-[hsl(var(--brand-navy))]">{selected.name}</h2>
                {selected.address ? (
                  <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
                    <span>{selected.address}</span>
                  </p>
                ) : null}
                {selectedLocated ? (
                  <p className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--brand-teal))]">
                    <MoveRight className="h-3.5 w-3.5" aria-hidden="true" /> {t('legal.mapFocused')}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-[hsl(var(--brand-orange))]">{t('legal.mapNoLocation')}</p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {selected.phone ? (
                    <a
                      href={`tel:${selected.phone.replace(/[^\d+]/g, '')}`}
                      className="r-chip bg-[hsl(var(--brand-teal-soft))] font-semibold text-[hsl(var(--brand-navy))]"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {selected.phone}
                    </a>
                  ) : null}
                  {selected.website ? (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="r-chip border border-border bg-card hover:bg-secondary"
                    >
                      <Globe className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.website')}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('legal.mapSelect')}</p>
            )}
          </div>

          <ProvidersMapList providers={all} selectedId={selectedId} onSelect={onSelect} />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{t('legal.mapNote')}</p>
    </div>
  );
}
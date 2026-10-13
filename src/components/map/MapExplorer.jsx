import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Globe, ExternalLink, MapPin, MoveRight } from 'lucide-react';
import MapFocus from '@/components/map/MapFocus';
import MapRecordList from '@/components/map/MapRecordList';

const TEAL = '#218c82';
const ORANGE = '#e07a09';
const CITY_CENTER = [40.7128, -74.006];
const ACTION_ICONS = { phone: Phone, site: Globe, link: ExternalLink };

function hasCoords(record) {
  return typeof record.lat === 'number' && typeof record.lng === 'number';
}

function Actions({ actions }) {
  if (!actions?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = ACTION_ICONS[action.icon] || ExternalLink;
        const external = !action.href.startsWith('tel:') && !action.href.startsWith('mailto:');
        return (
          <a
            key={`${action.icon}-${action.href}`}
            href={action.href}
            {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
            className="r-chip border border-border bg-card hover:bg-secondary"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {action.label}
          </a>
        );
      })}
    </div>
  );
}

export default function MapExplorer({
  records,
  selectedId,
  onSelect,
  titleOf,
  subtitleOf,
  summaryOf,
  detailsOf,
  actionsOf,
  labels,
}) {
  const all = records || [];
  const located = all.filter(hasCoords);
  const selected = all.find((record) => record.id === selectedId);
  const selectedLocated = selected && hasCoords(selected);
  const selectedLines = selected ? (detailsOf?.(selected) || []).filter(Boolean) : [];

  const popupFor = (record) => {
    const lines = (summaryOf?.(record) || detailsOf?.(record) || []).filter(Boolean);
    return (
      <Popup>
        <div className="space-y-1.5 text-[13px]">
          <p className="font-bold text-[hsl(var(--brand-navy))]">{titleOf(record)}</p>
          {subtitleOf(record) ? <p className="text-muted-foreground">{subtitleOf(record)}</p> : null}
          {lines.slice(0, 2).map((line) => (
            <p key={line} className="leading-snug">
              {line}
            </p>
          ))}
          <Actions actions={actionsOf?.(record)} />
        </div>
      </Popup>
    );
  };

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="r-card relative isolate overflow-hidden p-0">
          {located.length ? (
            <div className="h-[380px] w-full sm:h-[460px] lg:h-[560px]">
              <MapContainer center={CITY_CENTER} zoom={10} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                {selectedLocated ? <MapFocus lat={selected.lat} lng={selected.lng} /> : null}
                {located.map((record) => {
                  const active = record.id === selectedId;
                  const color = active ? ORANGE : TEAL;
                  return (
                    <CircleMarker
                      key={record.id}
                      center={[record.lat, record.lng]}
                      radius={active ? 13 : 9}
                      eventHandlers={{ click: () => onSelect(record.id) }}
                      pathOptions={{ color, fillColor: color, fillOpacity: active ? 0.95 : 0.85, weight: active ? 3 : 2 }}
                    >
                      {popupFor(record)}
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">{labels.empty}</p>
          )}
          <p className="border-t border-border p-3.5 text-xs text-muted-foreground">{labels.hint}</p>
        </div>

        <div className="space-y-4">
          <div className="r-card" aria-live="polite">
            {selected ? (
              <div className="space-y-2">
                <h2 className="font-heading text-base font-extrabold text-[hsl(var(--brand-navy))]">{titleOf(selected)}</h2>
                {subtitleOf(selected) ? (
                  <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
                    <span>{subtitleOf(selected)}</span>
                  </p>
                ) : null}
                {selectedLocated ? (
                  <p className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--brand-teal))]">
                    <MoveRight className="h-3.5 w-3.5" aria-hidden="true" /> {labels.focused}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-[hsl(var(--brand-orange))]">{labels.noLocation}</p>
                )}
                {selectedLines.length ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="pt-1">
                  <Actions actions={actionsOf?.(selected)} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{labels.select}</p>
            )}
          </div>

          <MapRecordList
            records={all}
            selectedId={selectedId}
            onSelect={onSelect}
            titleOf={titleOf}
            subtitleOf={subtitleOf}
            labels={labels}
          />
        </div>
      </div>
      {labels.note ? <p className="mt-3 text-xs text-muted-foreground">{labels.note}</p> : null}
    </div>
  );
}
import React from 'react';
import { Image } from '@/components/ui/image';

const HERO_IMAGE =
  'https://media.base44.com/images/public/6aca6b70e540702ef09fed45/7bede0791_generated_79513380.jpg';

export default function HomeHero() {
  return (
    <div className="rt-hero">
      <Image src={HERO_IMAGE} alt="" className="rt-hero-img" />
      <div className="rt-scrim" aria-hidden="true" />
    </div>
  );
}
import LandingContent from '@/components/LandingContent';

// No auth redirect — visible to guests and every signed-in role.
export default function AboutPage() {
  return <LandingContent />;
}

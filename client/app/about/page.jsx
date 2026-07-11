import LandingContent from '@/components/LandingContent';

export const metadata = {
  title: 'About — ShopSmart',
  description: 'Learn about ShopSmart, the marketplace platform for independent businesses.',
};

// No auth redirect — visible to guests and every signed-in role.
export default function AboutPage() {
  return <LandingContent />;
}

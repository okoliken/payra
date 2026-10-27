import { SearchBar as KitSearchBar, type SearchBarProps } from '@okoli/ui';
import { useUnistyles } from 'react-native-unistyles';
import { X } from 'lucide-react-native';
import { AppIcon } from '@/components/app-icon';

/** @okoli/ui's SearchBar with the Figma "Search Bar" icons. */
export function SearchBar(props: SearchBarProps) {
  const { theme } = useUnistyles();
  return (
    <KitSearchBar
      icon={<AppIcon name="search" size={18} color={theme.colors.text} />}
      clearIcon={<X size={12} strokeWidth={3} color={theme.colors.surfaceRaised} />}
      {...props}
    />
  );
}

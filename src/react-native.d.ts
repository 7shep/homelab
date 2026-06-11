declare module 'react-native' {
  import type { ComponentType, CSSProperties, ReactNode } from 'react';

  export type StyleProp<T> = T | Array<T | false | null | undefined> | false | null | undefined;

  export type ViewProps = {
    accessibilityRole?: string;
    children?: ReactNode;
    style?: StyleProp<CSSProperties>;
  };

  export type TextProps = ViewProps & {
    'aria-level'?: number;
  };

  export type ScrollViewProps = ViewProps & {
    contentContainerStyle?: StyleProp<CSSProperties>;
  };

  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;

  export const StyleSheet: {
    create<T extends Record<string, CSSProperties>>(styles: T): T;
  };
}

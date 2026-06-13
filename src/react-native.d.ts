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

  export type PressableProps = ViewProps & {
    onPress?: () => void;
    disabled?: boolean;
  };

  export type TextInputProps = ViewProps & {
    placeholder?: string;
    placeholderTextColor?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    multiline?: boolean;
  };

  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const Pressable: ComponentType<PressableProps>;
  export const TextInput: ComponentType<TextInputProps>;

  export const StyleSheet: {
    create<T extends Record<string, CSSProperties>>(styles: T): T;
  };
}

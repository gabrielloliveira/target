import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";
import { colors } from "@/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

type Props = {
  title: string;
  subtitle?: string;
  righButton?: {
    onPress: () => void;
    icon: keyof typeof MaterialIcons.glyphMap;
  };
};

export function PageHeader({ title, subtitle, righButton }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={32} color={colors.black} />
        </TouchableOpacity>

        {righButton && (
          <TouchableOpacity onPress={righButton.onPress}>
            <MaterialIcons
              name={righButton.icon}
              size={24}
              color={colors.gray[500]}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

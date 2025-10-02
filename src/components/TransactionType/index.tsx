import { View } from "react-native";
import { Option } from "./options";
import { styles } from "./styles";
import { colors } from "@/theme";
import { TransactionTypes } from "@/utils/TransactionTypes";

type Props = {
  selected: TransactionTypes;
  onChange: (type: TransactionTypes) => void;
};

export function TransactionType({ selected, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Option
        icon="arrow-upward"
        title="Guardar"
        isSelected={selected === TransactionTypes.INPUT}
        selectedColor={colors.blue[500]}
        onPress={() => onChange(TransactionTypes.INPUT)}
      />
      <Option
        icon="arrow-downward"
        title="Resgatar"
        isSelected={selected === TransactionTypes.OUTPUT}
        selectedColor={colors.red[400]}
        onPress={() => onChange(TransactionTypes.OUTPUT)}
      />
    </View>
  );
}

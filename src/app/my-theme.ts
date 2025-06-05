import { definePreset } from "@primeng/themes";
import Aura from "@primeng/themes/aura";

export const MyPreset = definePreset(Aura, {
  semantic: {

    primary: {
      // Couleur primary
      50: "#f0fdf5",
      100: "#dcfce8",
      200: "#bbf7d1",
      300: "#86efad",
      400: "#4ade81",
      500: "#22c55f",
      600: "#16a34b",
      700: "#15803d",
      800: "#166534",
      900: "#14532c",
      950: "#052e14",
    },

    //
    // En suite autant de couleur que tu veux
    //
    warning: {
      // Couleur primary
    },
    success: {
      // Couleur primary
    },
    error: {
      // Couleur primary
    },
    information: {
      // Couleur primary
    },
  },

  /*
  *****************
  *****************
  ICI C'EST LES COMPOSANTS
  *****************
  *****************
  */
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            primary: {
              background: "#ef4",
            },
            secondary: {
              background: "#212121",
            },
          },
        },
      },
    },
    select: {
      colorScheme: {
        light: {
          root: {
            background: "{form.field.background}",
          },
        },
      },
    },
  },
});

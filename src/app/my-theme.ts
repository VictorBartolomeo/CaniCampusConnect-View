import { definePreset } from "@primeng/themes";
import Aura from "@primeng/themes/aura";

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e8e9ec',
      100: '#c2c5cd',
      200: '#9ba0ae',
      300: '#757b8e',
      400: '#4e566f',
      500: '#1B2140',
      600: '#181d38',
      700: '#14172f',
      800: '#101227',
      900: '#0c0d1e',
      950: '#080915'
    },
    secondary: {
      50: '#f0f3e8',
      100: '#dbe2c3',
      200: '#c3cf9b',
      300: '#acbb73',
      400: '#96a74b',
      500: '#93C01F',
      600: '#84ad1b',
      700: '#759918',
      800: '#668615',
      900: '#577211',
      950: '#35460b'
    },
    success: {
      50: '#f0f3e8',
      100: '#dbe2c3',
      200: '#c3cf9b',
      300: '#acbb73',
      400: '#96a74b',
      500: '#93C01F', // $my-secondary
      600: '#84ad1b',
      700: '#759918',
      800: '#668615',
      900: '#577211',
      950: '#35460b'
    },
    warning: {
      50: '#fdf8f0',
      100: '#fbeedc',
      200: '#f7dcc0',
      300: '#f3c193',
      400: '#ef9f5b',
      500: '#EA8F16', // $my-accent
      600: '#d38014',
      700: '#ba7011',
      800: '#a1610e',
      900: '#88520b',
      950: '#543107'
    },
    error: {
      50: '#ffe8e8',
      100: '#ffc2c2',
      200: '#ff9c9c',
      300: '#ff7575',
      400: '#ff4f4f',
      500: '#ff0000', // Une couleur d'erreur standard
      600: '#cc0000',
      700: '#990000',
      800: '#660000',
      900: '#330000',
      950: '#1a0000'
    },
    info: {
      50: '#e8f7fd',
      100: '#c2effb',
      200: '#9be6fa',
      300: '#75dcf8',
      400: '#4ed3f6',
      500: '#5BC4F1', // $my-tertiary
      600: '#52b0d8',
      700: '#499dbe',
      800: '#4089a5',
      900: '#37768b',
      950: '#214754'
    },
  alias: {
    secondary: '#93C01F',
    secondary_20 : 'rgba(147, 192, 31, 0.2)',
    tertiary: '#5BC4F1',
    muted: '#64748B',
    muted_foreground: '#1B21407F',
    muted_secondary: '#93C01F33',
    accent: '#EA8F16',
    accent_2: '#F3BF00',
    white: '#fff',
    black: '#000',
    transparent: 'transparent',
  }
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
              background: "{primary.500}",
              color : "{alias.white}",
              HoverBackground : "{alias.white}",
              HoverColor : "{primary.500}",
              borderColor: '',
              hoverBorderColor: '{primary.500}',
            },
            secondary: {
              background: "#212121",
            },
            success :{
              background: "{success.500}",
              color : "{alias.white}"
            },
            warning :{
              background: "{warning.500}",
              color : "{alias.white}"
            },
            error :{
              background: "{error.500}",
              color : "{alias.white}"
            },
            contrast: {
              background: "{alias.white}",
              color : "{primary.500}"
            }
          },
        },
        dark : {
          root: {
            primary: {
              background: "{alias.white}",
              color : "{primary.500}"
            },
            secondary: {
              background: "#212121",
            },
          },
        }
      },
    },

    select: {
      colorScheme: {
        light: {
          root: {
            background: "{form.field.background}",
            color : "{primary.500}",
            borderColor: "{form.field.borderColor}",
            focusBorderColor: '{primary.500}',
            invalidBorderColor: '{error.500}',
            focusRing: {
              width: '10rem',
              style: '{form.field.focus.ring.style}',
              color: '{form.field.focus.ring.color}',
              offset: '{form.field.focus.ring.offset}',
              shadow: '{form.field.focus.ring.shadow}'}

          },
          overlay :{
            color: "{primary.500}"
          }
        },
      },
    },

    card: {
      colorScheme: {
        light: {
          background: "{alias.secondary_20}",
          color: "{primary.500}",
          shadow: '1px 1px 3px 0 {primary.500}, 0 1px 2px 0 rgba(255,0,0,0.06)',
        },
        dark: {
          background: "{alias.black}",
          color: "{alias.white}",
        }
      }
    },

    megaMenu : {
      colorScheme: {
        root: {
          gap : "1rem",
        }
      }
    },
    datepicker : {
      colorScheme: {
        root: {
          background: "{alias.white}",
          color: "{primary.500}",
          borderColor: "{form.field.borderColor}",
        },
        overlay :{
          color: "{primary.500}"
        }
      }
    },

    menu : {
      colorScheme: {
        root: {
          light: {
          background: "{alias.white}",
          color: "{primary.500}",
        },
        overlay :{
          color: "{primary.500}"
        },
          dark: {
          background: "{alias.white}",
          color: "{alias.white}",
          }
          },
        item : {
          light: {
          background: "{alias.white}",
          color: "{primary.500}",
          }

        }
      }
    },

    avatar : {
      colorScheme: {
        root: {
          light: {
          background: "{alias.white}",
          color: "{primary.500}",
          },
          dark: {
          background: "{alias.white}",
          color: "{alias.white}",
          }
        }
      }
    },

    inputtext :{
      colorScheme: {
        light : {
          root: {
            background: "{alias.white}",
            color: "{primary.500}",
            borderColor: "{form.field.borderColor}",
            focusBorderColor: '{primary.500}',
            invalidBorderColor: '{error.500}',
            focusRing: {
              width: '10rem',
              style: '{form.field.focus.ring.style}',
            }
          }
        },
        dark : {
          root: {
            background: "{alias.black}",
            color: "{alias.white}",
            borderColor: "{form.field.borderColor}",
            focusBorderColor: '{primary.500}',
            invalidBorderColor: '{error.500}',
            focusRing: {
              width: '10rem',
              style: '{form.field.focus.ring.style}',
            }
          }
        }
      }
    }


    //Composant suivant






    }

})




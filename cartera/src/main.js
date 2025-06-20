import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// 1. Import Vuetify styles
import "vuetify/styles";
import { createVuetify } from "vuetify";
// 2. Import all Vuetify components and directives
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
// 3. (Optional) Import default icon set if you want to use MDI icons with Vuetify components
import { aliases, mdi } from "vuetify/iconsets/mdi";

// Import your FontAwesome setup (assuming './plugins/fontawesome' handles this correctly)
import { FontAwesomeIcon } from "./plugins/fontawesome"; // Your existing import

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    // This configures Vuetify to use MDI icons
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});

const app = createApp(App);

// Register FontAwesome component globally
app.component("font-awesome-icon", FontAwesomeIcon);

// Use Vuetify
app.use(vuetify);

// Use Vue Router
app.use(router);

app.mount("#app");

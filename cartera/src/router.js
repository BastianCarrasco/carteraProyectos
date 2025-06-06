import { createRouter, createWebHistory } from "vue-router";
import Projects from "./views/Projects.vue";
import Create from "./views/Create.vue";
import Edit from "./views/Edit.vue";
import Statistics from "./views/Statistics.vue";
import Home from "./views/Home.vue";
import Doc from "./views/documents.vue";
import Formularios from "./views/fomularios.vue";
import Eval from "./views/Eval.vue";


const routes = [
  { path: "/", component: Home },
  { path: "/projects", component: Projects },
  { path: "/create", component: Create },
  { path: "/edit", component: Edit},
  { path: "/statistics", component: Statistics },
  { path: "/documents", component: Doc },
  { path: "/formularios", component: Formularios },
  { path: "/eval", component: Eval },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

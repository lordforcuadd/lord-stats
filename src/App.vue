<script setup>
import { ref, onMounted } from "vue";

// --- estado global ---
const users = ref([]);
const isLoading = ref(false);
const isModalOpen = ref(false);
const editingId = ref(null);

// --- form ---
const newUser = ref({ name: "", username: "", email: "", phone: "" });
const formErrors = ref({ name: "", username: "", email: "", phone: "" });

// --- api ---
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error("Error en petición");
    users.value = await res.json();
  } catch (error) {
    console.error("Error cargando la data:", error);
  } finally {
    isLoading.value = false;
  }
};

const openModal = (user = null) => {
  formErrors.value = { name: "", username: "", email: "", phone: "" };

  if (user) {
    // edit: cargamos los datos del usuario
    editingId.value = user.id;
    newUser.value = { ...user };
  } else {
    // agregar: reseteamos el formulario
    editingId.value = null;
    newUser.value = { name: "", username: "", email: "", phone: "" };
  }
  isModalOpen.value = true;
};

// --- nuestras propias validaciones ---
const validateForm = () => {
  let isValid = true;
  formErrors.value = { name: "", username: "", email: "", phone: "" };

  if (newUser.value.name.trim().length < 3) {
    formErrors.value.name = "Mínimo 3 caracteres requeridos";
    isValid = false;
  }
  if (!newUser.value.username.trim() || /\s/.test(newUser.value.username)) {
    formErrors.value.username = "Usuario inválido o con espacios";
    isValid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.value.email)) {
    formErrors.value.email = "Formato de correo incorrecto";
    isValid = false;
  }
  if (!/^[0-9\-\+() x\.]{7,25}$/.test(newUser.value.phone)) {
    formErrors.value.phone = "Formato de teléfono no válido";
    isValid = false;
  }

  return isValid;
};

const saveUser = () => {
  if (!validateForm()) return;

  if (editingId.value) {
    // cctualizar registro existente
    const index = users.value.findIndex((u) => u.id === editingId.value);
    if (index !== -1)
      users.value[index] = { ...users.value[index], ...newUser.value };
  } else {
    // crear nuevo registro
    const newId = users.value.length
      ? Math.max(...users.value.map((u) => u.id)) + 1
      : 1;
    users.value.push({ id: newId, ...newUser.value });
  }

  isModalOpen.value = false;
};

const deleteUser = (id) => {
  if (confirm("¿Seguro que deseas eliminar este registro?")) {
    users.value = users.value.filter((u) => u.id !== id);
  }
};

// inciar
onMounted(fetchUsers);
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 font-sans text-gray-800">
    <div
      class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"
    >
      <h1 class="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
      <button
        @click="openModal()"
        class="bg-gray-400 hover:bg-gray-700 text-white font-bold py-2 px-5 rounded shadow transition-colors"
      >
        Agregar
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <span class="ml-4 text-gray-600 font-medium text-lg"
        >Cargando datos..</span
      >
    </div>

    <div
      v-else
      class="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200"
    >
      <table class="min-w-full text-left border-collapse">
        <thead>
          <tr
            class="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold tracking-wider"
          >
            <th class="py-4 px-6">ID</th>
            <th class="py-4 px-6">Nombre</th>
            <th class="py-4 px-6">Usuario</th>
            <th class="py-4 px-6">Email</th>
            <th class="py-4 px-6">Teléfono</th>
            <th class="py-4 px-6 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr
            v-for="user in users"
            :key="user.id"
            class="border-b border-gray-100 hover:bg-blue-50 transition-colors"
          >
            <td class="py-3 px-6 font-bold text-gray-500">{{ user.id }}</td>
            <td class="py-3 px-6 font-medium">{{ user.name }}</td>
            <td class="py-3 px-6">{{ user.username }}</td>
            <td class="py-3 px-6 text-blue-600">{{ user.email }}</td>
            <td class="py-3 px-6">{{ user.phone }}</td>
            <td class="py-3 px-6 text-center whitespace-nowrap">
              <button
                @click="openModal(user)"
                class="bg-gray-400 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 rounded text-xs mr-2 shadow-sm transition-colors"
              >
                Editar
              </button>
              <button
                @click="deleteUser(user.id)"
                class="bg-black hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded text-xs shadow-sm transition-colors"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="text-center py-10 text-gray-500">
        No hay usuarios registrados.
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ editingId ? "Editar Usuario" : "Nuevo Usuario" }}
          </h2>
          <button
            @click="isModalOpen = false"
            class="text-gray-400 hover:text-red-500 text-3xl font-bold leading-none focus:outline-none transition-colors"
            title="Cerrar"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Nombre completo</label
            >
            <input
              v-model="newUser.name"
              type="text"
              :class="{ 'border-red-500 bg-red-50': formErrors.name }"
              class="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
            />
            <p v-if="formErrors.name" class="text-red-500 text-xs mt-1">
              {{ formErrors.name }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Usuario</label
            >
            <input
              v-model="newUser.username"
              type="text"
              :class="{ 'border-red-500 bg-red-50': formErrors.username }"
              class="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
            />
            <p v-if="formErrors.username" class="text-red-500 text-xs mt-1">
              {{ formErrors.username }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Correo Electrónico</label
            >
            <input
              v-model="newUser.email"
              type="text"
              :class="{ 'border-red-500 bg-red-50': formErrors.email }"
              class="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
            />
            <p v-if="formErrors.email" class="text-red-500 text-xs mt-1">
              {{ formErrors.email }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Teléfono</label
            >
            <input
              v-model="newUser.phone"
              type="text"
              :class="{ 'border-red-500 bg-red-50': formErrors.phone }"
              class="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
            />
            <p v-if="formErrors.phone" class="text-red-500 text-xs mt-1">
              {{ formErrors.phone }}
            </p>
          </div>

          <div class="flex justify-end pt-4">
            <button
              type="submit"
              class="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2.5 px-6 rounded-lg w-full sm:w-auto transition-colors shadow-md"
            >
              {{ editingId ? "Actualizar" : "Guardar" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

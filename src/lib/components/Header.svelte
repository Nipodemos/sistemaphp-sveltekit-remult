<script lang="ts">
  let isDropdownOpen = $state(false);

  const dropdownOptions = [
    { label: "Perfil", href: "/app/perfil" },
    { label: "Configurações", href: "/app/config" },
    { label: "Sair", href: "/logout" },
  ];

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  // Fecha o dropdown quando clica fora
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest(".dropdown-container")) {
      isDropdownOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<header
  class="fixed top-0 z-50 w-full border-b border-surface-200-800 bg-surface-50-950"
>
  <div class="flex h-16 items-center justify-between px-3">
    <!-- Logo da empresa -->
    <div class="flex items-center">
      <div class="flex items-center space-x-2">
        <!-- Placeholder para logo - substitua por sua logo real -->
        <div
          class="h-8 w-8 rounded bg-primary-500 flex items-center justify-center"
        >
          <span class="text-primary-contrast font-bold text-sm">L</span>
        </div>
        <span class="font-bold text-lg text-surface-900-50">Logo Empresa</span>
      </div>
    </div>

    <!-- Menu dropdown no canto direito -->
    <div class="relative dropdown-container">
      <button
        type="button"
        class="btn preset-tonal flex items-center space-x-2 hover:preset-filled"
        onclick={toggleDropdown}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <span>Menu</span>
        <svg
          class="h-4 w-4 transition-transform duration-200 {isDropdownOpen
            ? 'rotate-180'
            : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {#if isDropdownOpen}
        <div
          class="absolute right-0 mt-2 w-48 rounded-md border border-surface-200-800 bg-surface-50-950 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        >
          <div class="py-1" role="menu">
            {#each dropdownOptions as option}
              <a
                href={option.href}
                class="block px-4 py-2 text-sm text-surface-700-200 hover:bg-surface-100-900 hover:text-surface-900-50 transition-colors"
                role="menuitem"
                onclick={() => (isDropdownOpen = false)}
              >
                {option.label}
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</header>

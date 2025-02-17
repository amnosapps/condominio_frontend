
export const formatCPF = (value) => {
    return value
      .replace(/\D/g, '') // Remove non-numeric characters
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
      .slice(0, 14); // Limit to CPF format
  }
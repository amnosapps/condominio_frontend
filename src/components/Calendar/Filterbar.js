const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  gap: 15px;
`;

const FilterSelect = styled.select`
  padding: 8px 15px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    border-color: #1e88e5;
    box-shadow: 0 0 8px rgba(30, 136, 229, 0.2);
  }
`;

const FilterInput = styled.input`
  padding: 8px 15px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    border-color: #1e88e5;
    box-shadow: 0 0 8px rgba(30, 136, 229, 0.2);
  }

  &::placeholder {
    color: #888;
    font-size: 0.9rem;
  }
`;

const ClearButton = styled.button`
  background-color: #f46600;
  color: white;
  border: none;
  padding: 8px 15px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c95c58;
  }
`;

const FilterBar = ({ guestNameFilter, setGuestNameFilter, typeFilter, setTypeFilter, statusFilter, setStatusFilter, clearFilters }) => {
  return (
    <FilterContainer>
      <FilterInput
        type="text"
        placeholder="Filtrar por nome"
        value={guestNameFilter}
        onChange={(e) => setGuestNameFilter(e.target.value)}
      />
      <FilterSelect
        value={typeFilter || ''}
        onChange={(e) => setTypeFilter(e.target.value !== '' ? parseInt(e.target.value, 10) : null)}
      >
        <option value="">Filtrar por Tipo</option>
        <option value={0}>Temporada</option>
        <option value={1}>Moradia</option>
      </FilterSelect>
      <FilterSelect
        value={statusFilter || ''}
        onChange={(e) => setStatusFilter(e.target.value !== '' ? parseInt(e.target.value, 10) : null)}
      >
        <option value="">Filtrar por Status</option>
        <option value={0}>Disponível</option>
        <option value={1}>Ocupado</option>
        <option value={2}>Manutenção</option>
      </FilterSelect>
      <ClearButton onClick={clearFilters}>Limpar Filtros</ClearButton>
    </FilterContainer>
  );
};

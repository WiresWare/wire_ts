class FilterValues {
  static ALL = 0;
  static ACTIVE = 1;
  static COMPLETED = 2;

  static shouldApplyFilter(isCompleted: boolean, filter: number) {
    return (
      filter !== FilterValues.ALL &&
      ((isCompleted && filter === FilterValues.ACTIVE) || (!isCompleted && filter === FilterValues.COMPLETED))
    );
  }
}

export default FilterValues;

/**
 * 
 * @param {Object} object - Objeto de consulta de pessoa retornado do banco de dados,
 * * @param {Array} joins - Array de objetos com as informações de join (from, localField, foreignField, as)
 * * @param {Array} conditions - Array de objetos com as condições de filtro (field, operator, value)
 * * @param {Object} project - Objeto com os campos a serem retornados (opcional)
 * @returns 
 */
const findWithJoinCascade = async ({
    model,
    joins = [],
    conditions = [],
    convertDates = [],
    project = null
  }) => {
    const pipeline = [];
  
    // Add lookups
    joins.forEach(({ from, localField, foreignField = '_id', as }) => {
      pipeline.push({
        $lookup: {
          from,
          localField,
          foreignField,
          as
        }
      });
      pipeline.push({ $unwind: `$${as}` });
    });
  
    // Add filters (AND conditions)
    if (conditions.length > 0) {
      pipeline.push({
        $match: {
          $and: conditions
        }
      });
    }

    if (convertDates.length > 0) {
      const dateFields = {};
      convertDates.forEach((field) => {
        dateFields[field] = { $toDate: `$${field}` };
      });
      pipeline.push({ $addFields: dateFields });
    }

    if (project) {
        pipeline.push({ $project: project });
      }
  
    return await model.aggregate(pipeline);
  };
  
  export default findWithJoinCascade;
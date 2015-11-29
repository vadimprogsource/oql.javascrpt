//JavaScript OQL definition:
//.from(<Source Name>)
//.join({[left:<true|false>][,outer:<true|false>],from:<Source Name>,on:<Condition>})
//.map ({<field name>:'<string expression>'})
//.select({<field name>:'<string expression>'})
//.where({<logic operator>:[<logic expression>,<logic expression>]|<field name>:{<compare operator>:<value>}})
//.groupBy({<field name>:{}})
//.orderBy({<field name>:true|false})


    

//====================SELECT EXAMPLE==============================
var searchPattern = '*soft';
new queryBuilder()
           .from('customers c')
           .join({ left: true, outer: true, from: 'person p', on: 'c.person_id=p.id' })
           .select({ Company: 'c.company_name', Person: 'p.person_name', Salary: 'p.person_salary' })
           .where
           (
               {
                   and:
                    [
                       {
                           or:
                              [
                                { Company: { like: searchPattern } },
                                { Person: searchPattern }
                              ]
                       }
                      , { Salary: { '>': 2000 } }
                    ]
               }
           )
           .where({ Salary: { '<': 5000 } })
           .toArray();


//========================GROUP BY EXAMPLE======================

new queryBuilder()
           .from('employee e')
           .select({ Departament: 'e.departament_id', TotalSalary: 'sum(e.salary)' })
           .groupBy({ Departament: {} })
           .having({ TotalSalary: { in: [1000, 2000, 3000] } })
           .toArray();

//==========================INSERT EXAMPLE=======================
new queryBuilder()
          .from('customers')
          .map({ Id: 'company_unique_id', Name: 'company_name', PostalAddress: 'company_postal_address' })
          .insert({ Id: 1, Name: 'Microsoft' })
          .insert({ PostalAddress: 'Cardinal Place, 80-100 Victoria Street, London, SW1E 5JL.' })
          .execute();



//==========================UPDATE EXAMPLE=====================
new queryBuilder()
          .from('customers')
          .map   ({Id: 'company_unique_id', Name: 'company_name', PostalAddress: 'company_postal_address' })
          .update({Name: 'Microsoft' })
          .update({PostalAddress: 'Cardinal Place, 80-100 Victoria Street, London, SW1E 5JL.' })
          .where({ Id: 1 })
          .execute();


//===========================DELETE EXAMPLE=====================
new queryBuilder()
        .from('customers')
        .map({ Id: 'company_unique_id', CreatedDate: 'company_created_date' })
        .where({ Id: { '=': 1 } })
        .where({ CreatedDate: { between: [new Date(), new Date()] } })
        .delete()
        .execute();


//==========================DYNAMIC QUERY EXAMPLE========================        


var companyFilter = { Company: { like: 'hello' } };
var customerFilter = { Customer: 'hello' };
var id = { Id: { ">": 1 } };

var orArray = [];

if (companyFilter)
{
    orArray.push(companyFilter);
}

if (customerFilter)
{
    orArray.push(customerFilter);
}

if (id)
{
    orArray.push(id);
}

var resultSet = new queryBuilder()
                   .from("customer c")
                   .where({ or: orArray })
                   .toArray();


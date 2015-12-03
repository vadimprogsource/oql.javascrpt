
function sqlProvider()
{
}



 sqlProvider.prototype.toString = function (value)
 {
        if (value == null)
        {
            return null;
        }

        if (typeof value === "string")
        {
            return "'" + value.replace("'","''") + "'";
        }

        if(value===true)
        {
           return 1;  
        }
        
        if(value===false)
        {
           return 0;  
        }  
  

        if (value instanceof Date)
        {
            var date = new Date(value);
            return "'"+date.getFullYear() + "-" + (date.getMonth() + 1).toString() + "-" + date.getDate()+"'";
        }
       
        return value.toString();
 }


 sqlProvider.prototype.executeQuery = function(cmd)
 {
 }

sqlProvider.prototype.executeNonQuery = function(cmd)
{
}

module.exports = sqlProvider;


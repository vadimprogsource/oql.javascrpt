var expressionBuilder = require('./expressionBuilder');
var sqlProvider       = require('./sqlProvider');

function queryBuilder(provider)
{

    if (!provider)
    {
        provider = new sqlProvider();
    }



    this.$provider = provider;

    this.$from    = new expressionBuilder(this);
    this.$select  = new expressionBuilder(this);
    this.$where   = new expressionBuilder(this);
    this.$groupby = new expressionBuilder(this);
    this.$orderby = new expressionBuilder(this);
    this.$having  = new expressionBuilder(this);

    this.$insert = new expressionBuilder(this);
    this.$values = new expressionBuilder(this);

    this.$update = new expressionBuilder(this);
    this.$delete = false;

    

}

queryBuilder.prototype.clear = function ()
{
    this.$from.clear();
    this.$select.clear();
    this.$where.clear();
    this.$groupby.clear();
    this.$orderby.clear();
    this.$having.clear();
    this.$insert.clear();
    this.$values.clear();
    this.$update.clear();
    this.$delete = false;

    return this;
}

queryBuilder.prototype.from = function (table)
{
    this.$from.clear().append(table);
    return this;
}

queryBuilder.prototype.join = function (obj)
{
    this.$from
        .append(" ");


    if (obj.left)
    {
        this.$from.append(" left");
    }

    if (obj.right)
    {
        this.$from.append(" right");
    }

    if (obj.cross)
    {
         this.$from.append(" cross");
    }

    if (obj.outer)
    {
        this.$from.append(" outer");
    }
    else
    {
       this.$from.append(" inner");
    }


    this.$from.append(" join");


    this.$from
        .append(' ')
        .append(obj.from)
        .append(' on ')
        .append(obj.on);

    return this;
}


queryBuilder.prototype.innerJoin = function (from,on)
{
   return this.join({from:from,on:on});
}

queryBuilder.prototype.outerJoin = function (from,on)
{
   return this.join({outer:true,left:true,from:from,on:on});
}



  queryBuilder.prototype.map = function (mapper)
  {
        if (this.mapper)
        {
            for (var x in mapper)
            {
                this.mapper[x] = mapper[x];
            }

            return this;
        }


        this.mapper = mapper;
        return this;
  }


    queryBuilder.prototype.select = function (mapper)
    {

        if (typeof mapper === 'string' || mapper instanceof String)
        {
            this.$select.appendSeparator().append(mapper);
            return this;
        }



        var mapFlag = this.mapper;
     
        if (!mapFlag)
        {
            this.mapper = mapper;
        }

        for (var property in mapper)
        {

            if (mapFlag)
            {
                this.mapper[property] = mapper[property];
            }

            this.$select.appendSeparator().appendField(property);
        }

        if (!this.mapper)
        {
            this.mapper = mapper;
        }

        return this;
    }

    queryBuilder.prototype.where = function (lambda)
    {
        this.$where
            .appendAnd()
            .appendWhere(lambda);

        return this;
    }

    queryBuilder.prototype.filterBy = function (lambda)
    {

        if (lambda)
        {
            this.$where.appendFilter(lambda);
        }

        return this;
    }


    
queryBuilder.prototype.groupBy = function (obj)
{
        for (var x in obj)
        {
            this.$groupby.appendSeparator().appendField(x); 
        }

        return this;
}

queryBuilder.prototype.having = function (lambda)
{
    this.$having
         .appendAnd()
         .appendWhere(lambda);

    return this;
}

queryBuilder.prototype.orderBy = function (obj)
{
        for (var x in obj)
        {
            this.$orderby.appendSeparator()
                         .appendField    (x);

            if (obj[x])
            {
                this.$orderby.append(" asc");
                continue;
            }

            this.$orderby.append(" desc");
        }

        return this;
}  

queryBuilder.prototype.insert = function (obj)
{
    for (var x in obj)
    {
        this.$insert.appendSeparator().appendField(x);
        this.$values.appendSeparator().append(this.$provider.toString(obj[x]));
    }

    return this;
}

queryBuilder.prototype.update = function (obj)
{
    for (var x in obj)
    {
        this.$update
            .appendSeparator()
            .appendField(x)
            .append("=")
            .append(this.$provider.toString(obj[x]));
    }

    return this;
}

queryBuilder.prototype.delete = function ()
{
    this.$delete = true;
    return this;
}


queryBuilder.prototype.toString = function ()
{
    var query = new expressionBuilder();

    if (this.$insert.hasData())
    {
        return query.append("insert into ")
                    .append(this.$from)
                    .append('(')
                    .append(this.$insert)
                    .append(")values(")
                    .append(this.$values)
                    .append(")")
                    .toString();
    }

    if (this.$update.hasData())
    {
        query.append("update ").append(this.$from).append(" set ").append(this.$update);

        if (this.$where.hasData())
        {
            query.append(" where ").append(this.$where);
        }

        return query.toString();
    }

    if (this.$delete)
    {
        query.append("delete from ").append(this.$from);

        if (this.$where.hasData())
        {
            query.append(" where ").append(this.$where);
        }

        return query.toString();
    }
 

    return this.toSelectString();
}

queryBuilder.prototype.toSelectString = function ()
{

    var query = new expressionBuilder().append("select ");


    if (this.$select.hasData())
    {
        query.append(this.$select);
    }
    else
    {
        query.append("*");
    }

    query.append(" from ")
         .append(this.$from);

    if (this.$where.hasData())
    {
        query.append(" where ")
             .append(this.$where);
    }

    if (this.$groupby.hasData())
    {
        query.append(" group by ")
             .append(this.$groupby);

        if (this.$having)
        {
           query.append(" having ")
                .append(this.$having);

        }

    }


    if (this.$orderby.hasData())
    {
        query.append(" order by ")
             .append(this.$orderby);
    }

    return query.toString();
}

queryBuilder.prototype.toArray = function ()
{
    if (this.$provider && this.$provider.executeQuery)
    {
        return this.$provider.executeQuery(this.toSelectString());
    }
}

queryBuilder.prototype.execute = function ()
{
    if (this.$provider && this.$provider.executeNonQuery)
    {
        return this.$provider.executeNonQuery(this.toString());
    }

}


module.exports = queryBuilder;

function expressionBuilder(queryProvider)
{
    this.queryProvider = queryProvider;
    this.innerText = "";
}


expressionBuilder.prototype.hasData = function ()
{
    if (this.innerText)
    {
        return true;
    }

    return false;
}


expressionBuilder.prototype.clear = function ()
{
    this.innerText = "";
    return this;

}



expressionBuilder.prototype.append = function (obj)
{
    this.innerText += obj;
    return this;
}


expressionBuilder.prototype.appendSeparator = function (obj)
{
    if (this.innerText)
    {
        this.innerText += ',';
    }

    return this;
}


expressionBuilder.prototype.appendField = function (obj)
{
    if (this.queryProvider.mapper)
    {
        var mapName =  this.queryProvider.mapper[obj];

        if(mapName)
        {
            this.innerText += mapName;
            return this;
        }
    }

    this.innerText += obj;
    return this;
}


expressionBuilder.prototype.appendAnd = function ()
{

    if (this.innerText)
    {
        this.innerText += " and ";
    }

    return this;
}

expressionBuilder.prototype.appendOr = function ()
{
    if (this.innerText)
    {
        this.innerText += " or ";
    }

    return this;
}


  expressionBuilder.prototype.visitConst = function (value)
  {
        if(Array.isArray(value))
        {
            for (var i = 0, len = value.length; i < len; i++)
            {
                this.appendSeparator()
                    .append("(")
                    .append(this.queryProvider.$provider.toString(value[i]))
                    .append(")");
            }
        }

        return this.append(this.queryProvider.$provider.toString(value));
  }


expressionBuilder.prototype.visitLambda = function (lambda)
{
    for (var x in lambda)
    {
        return this.visitExpression(x, lambda[x]);
    }

    return this;
}

    expressionBuilder.prototype.visitBinary = function (left, op, right)
    {

        return this.append("(")
                   .visitLambda(left)
                   .append(op)
                   .visitLambda(right)
                   .append(")")  
    }

    expressionBuilder.prototype.visitMany = function ( op, array)
    {
        this.append("(");

        for (var i = 0; i < array.length; i++)
        {
            if (i)
            {
                this.append(op);
            }

            this.visitLambda(array[i]);
        }

        return this.append(")");
    }


    expressionBuilder.prototype.visitUnary = function (op, right)
    {

        if (Array.isArray(right))
        {
            right = right[0];
        }

        return this.append(op)
                   .append("(")
                   .visitLambda(right)
                   .append(")");
    }





    expressionBuilder.prototype.executeVisitBinary = function (op, body)
    {
        var left  = null;
        var right = null;


        if (Array.isArray(body))
        {
            if (body.length > 2)
            {
                return this.visitMany(op, body);
            }

            left  = body[0];
            right = body[1];
        }
        else
        {
            for (var x in body)
            {
                if (left)
                {
                    right    = {};
                    right[x] = body[x];
                    break;
                }

                left    = {};
                left[x] = body[x];
            }
        }

        return this.visitBinary(left, op, right);
    }



    expressionBuilder.prototype.visitBetween = function (array)
    {
        return this.append(" between ")
                   .visitConst(array[0])
                   .append(" and ")
                   .visitConst(array[1]);
    }


    expressionBuilder.prototype.visitLike = function (pattern)
    {
        return this.append    (" like ")
                   .visitConst(pattern);
    }

    expressionBuilder.prototype.visitIn = function (body)
    {

        this.append(" in (");

        if (Array.isArray(body))
        {
            for (var i = 0, len = body.length; i < len; i++)
            {
                if (i)
                {
                    this.append(",");
                }

                this.visitConst(body[i]);
            }
        }
        else
        {
            this.append(body);
        }

       return this.append(")");
    }

    expressionBuilder.prototype.executeVisitOp = function (op)
    {
        for (var x in op)
        {

            switch (x.toLowerCase())
            {
                case "between":
                    
                    var array = op[x];

                    if (Array.isArray(array) && array.length > 1)
                    {
                        return this.visitBetween(array);
                    }
                    continue;

                case "like": return this.visitLike(op[x]);
                case "in"  : return this.visitIn(op[x])

                default: return this.append(x)
                                          .visitConst(op[x]);
     
            
            }

   
        }

        return this;
    }




    expressionBuilder.prototype.visitExpression = function (field, body)
    {


        switch (field.toLowerCase())
        {
            case "not"    : return this.visitUnary         (" not "    , body);
            case "and"    : return this.executeVisitBinary (" and "    , body);
            case "or"     : return this.executeVisitBinary (" or "     , body);
            default       :
                          
                this.appendField(field);  
                           
                if (body==null)
                {
                    return this.append(" is null");
                }
                          
                if (typeof body === "object")
                {
                    return this.executeVisitOp(body);
                }
                           
                this.append("=");
                return this.visitConst(body);
        }

    }




    expressionBuilder.prototype.appendWhere = function (lambda)
    {
        return this.visitLambda(lambda);
    }


    expressionBuilder.prototype.appendFilter = function (lambda)
    {
        for (var x in lambda)
        {
            var obj = lambda[x];

            if (!obj)
            {
                continue;
            }

            if (this.hasData())
            {
                this.appendAnd();
            }

            this.appendField(x);


            if (typeof obj === 'string' || obj instanceof String)
            {
                if (obj.indexOf('%') < 0)
                {
                    obj = '%' + obj + '%';
                }

                this.visitLike(obj);
                continue;
            }


            if (obj == null)
            {
                this.append(" is null");
                continue;
            }

            this.append("=").VisitConst(obj);

        }



        return this;
    }



    expressionBuilder.prototype.toString = function ()
    {
        return this.innerText;
    }



module.exports = expressionBuilder;
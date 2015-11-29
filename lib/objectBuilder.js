
function objectBuilder(obj)
{

    this.$object = {};

    if (obj)
    {
      if (typeof obj === 'string' || obj instanceof String)
      {
         this.$object = JSON.parse(obj);
         return;
       }

      this.$object = obj;
    }
}



objectBuilder.prototype.appendToObject = function (part, other)
{
    var $this = this.$object[part];

    if ($this)
    {
        for (var x in other)
        {
            $this[x] = other[x];
        }

        this.$object[part] = $this;
    }
    else
    {
        this.$object[part] = other;
    }

    return this;
}

objectBuilder.prototype.appendToArray = function(part, other)
{
    var $this = this.$object[part];


    if ($this)
    {
        var array ;

        if (Array.isArray($this))
        {
            array = $this;
        }
        else
        {
            array = new Array();
            array.push($this);
        }

        array.push(other);
        $this = array;
    }
    else
    {
        $this = other;
    }
   
  
    this.$object[part] = $this;
    return this;
}


objectBuilder.prototype.from = function (obj)
{
    this.$object.from = obj.toString();
    return this;
}

objectBuilder.prototype.join = function (obj)
{
    return this.appendToArray('join', obj);
}


objectBuilder.prototype.map = function (obj)
{
    return this.appendToObject('map', obj);
}

objectBuilder.prototype.select = function (obj)
{
    return this.appendToObject('select', obj);
}

objectBuilder.prototype.where = function (lambda)
{
    return this.appendToArray('where', lambda);
}

objectBuilder.prototype.groupBy = function (obj)
{
    return this.appendToObject('groupBy', obj);
}

objectBuilder.prototype.having = function (lambda)
{
    return this.appendToArray('having', lambda);
}

objectBuilder.prototype.orderBy = function (obj)
{
    return this.appendToObject('orderBy', obj);
}


objectBuilder.prototype.insert = function (obj)
{
    return this.appendToObject('insert', obj);
}

objectBuilder.prototype.update = function (obj)
{
    return this.appendToObject('update', obj);
}

objectBuilder.prototype.delete = function ()
{
    this.$object.delete = {};
    return this;
}


objectBuilder.prototype.mergeTo = function(other)
{
    for (var x in this.$object)
    {
        var obj    = this.$object[x];
        var f = other[x];

        if (f)
        {
            if (Array.isArray(obj))
            {
                for (var i = 0, len = obj.length ; i < len; i++)
                {
                    other[x](obj[i]);
                }
                continue;
            }

            other[x](obj);
        }
    }
}

objectBuilder.prototype.toString = function ()
{
    return JSON.stringify(this.$object);
}

module.exports = objectBuilder;
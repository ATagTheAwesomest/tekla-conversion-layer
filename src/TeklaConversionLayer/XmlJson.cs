using System.Text.Json;
using System.Text.Json.Nodes;
using System.Xml;
using System.Xml.Linq;

namespace TeklaConversionLayer;

/// <summary>
/// Converts between the JSON the web app speaks and PowerFab's XML.
/// Objects become child elements, arrays become repeated elements, values become text.
/// </summary>
public static class XmlJson
{
    public static XElement ToXml(string name, JsonNode? node)
    {
        var element = new XElement(PowerFabClient.RequestNs + ValidName(name));
        switch (node)
        {
            case null:
                break;
            case JsonObject obj:
                foreach (var (key, value) in obj)
                {
                    if (value is JsonArray items)
                        foreach (var item in items) element.Add(ToXml(key, item));
                    else
                        element.Add(ToXml(key, value));
                }
                break;
            case JsonArray:
                throw new ArgumentException($"'{name}' cannot be a nested array.");
            case JsonValue value:
                element.Value = value.GetValueKind() switch
                {
                    JsonValueKind.True => "true",
                    JsonValueKind.False => "false",
                    JsonValueKind.String => value.GetValue<string>(),
                    _ => value.ToJsonString(),
                };
                break;
        }
        return element;
    }

    /// <summary>
    /// Leaf elements become strings; repeated child names become arrays. Namespaces are dropped.
    /// Attributes become "@name" keys, and a leaf's text sits next to them under "#text", so
    /// &lt;Weight UOM="kg"&gt;123&lt;/Weight&gt; becomes { "@UOM": "kg", "#text": "123" }.
    /// </summary>
    public static JsonNode? ToJson(XElement element)
    {
        var attributes = element.Attributes().Where(a => !a.IsNamespaceDeclaration).ToList();
        if (!element.HasElements && attributes.Count == 0)
            return JsonValue.Create(element.Value);

        var obj = new JsonObject();
        foreach (var attribute in attributes)
            obj["@" + attribute.Name.LocalName] = attribute.Value;
        if (!element.HasElements && element.Value.Length > 0)
            obj["#text"] = element.Value;

        foreach (var group in element.Elements().GroupBy(e => e.Name.LocalName))
        {
            var children = group.Select(ToJson).ToList();
            obj[group.Key] = children.Count == 1 ? children[0] : new JsonArray(children.ToArray());
        }
        return obj;
    }

    static string ValidName(string name)
    {
        try { return XmlConvert.VerifyNCName(name); }
        catch (XmlException) { throw new ArgumentException($"'{name}' is not a valid PowerFab field name."); }
    }
}

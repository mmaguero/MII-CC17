package oldapi;
import java.io.IOException;
import java.lang.InterruptedException;
import java.util.Iterator;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class StatCleanupReducer extends Reducer<Text, DoubleWritable, Text, DoubleWritable> {
	public void reduce(Text key, Iterator<DoubleWritable> values, Context context) throws IOException, InterruptedException {
		Double maxValue = Double.MIN_VALUE;
		while (values.hasNext()) {
			maxValue = Math.max(maxValue, values.next().get());
		}
		context.write(key, new DoubleWritable(maxValue));
	}
}

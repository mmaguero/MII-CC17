package oldapi;
import java.io.IOException;
import java.util.Iterator;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapred.MapReduceBase;
import org.apache.hadoop.mapred.OutputCollector;
import org.apache.hadoop.mapred.Reducer;
import org.apache.hadoop.mapred.Reporter;

public class CorrReducer extends MapReduceBase implements Reducer<Text, Text, Text, DoubleWritable> {
	public void reduce(Text key, Iterator<Text> values, OutputCollector<Text, DoubleWritable> output, Reporter reporter) throws IOException {
		double x = 0, y = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0, rows = 0;
		String line;
		while (values.hasNext()) {
			line = values.next().toString();
			String[] parts = line.split(",");
			x = Double.parseDouble(parts[0]);
			y = Double.parseDouble(parts[1]);
			//stage 1
			sumX += x;
			sumY += y;
			//stage 2
			sumXY += x * y;
			//stage 3
			sumX2 += Math.pow(x, 2);
			sumY2 += Math.pow(y, 2);
			//stage all
			rows++;
		}
		//stage 1
		double ariAvgX = sumX / rows;
		double ariAvgY = sumY / rows;
		//stage 2
		double covariance = sumXY / rows - ariAvgX * ariAvgY;
		//stage 3
		double typDevX = Math.sqrt(sumX2 / rows - Math.pow(ariAvgX, 2));
		double typDevY = Math.sqrt(sumY2 / rows - Math.pow(ariAvgY, 2));
		//stage 4
		double linCorCoefficient = covariance / (typDevX * typDevY);
		output.collect(key, new DoubleWritable(linCorCoefficient));
	}
}
